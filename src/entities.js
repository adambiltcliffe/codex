import produce, { createDraft, finishDraft, isDraft } from "immer";
import cardInfo, { types } from "./cardinfo";
import fixtures from "./fixtures";
import log from "./log";
import { patrolSlots } from "./patrolzone";
import { triggerDefinitions } from "./triggers";

import get from "lodash/get";
import forEach from "lodash/forEach";

export function createUnit(state, owner, card) {
  const newUnit = {
    id: `e${state.nextId}`,
    card,
    owner,
    lastControlledBy: owner,
    controlledSince: state.turn,
    ready: true,
    damage: 0,
    runes: 0,
    thisTurn: {}
  };
  state.entities[newUnit.id] = newUnit;
  state.nextId++;
  applyStateBasedEffects(state);
  return newUnit.id;
}

export function createHero(state, owner, card) {
  const newHero = {
    id: `e${state.nextId}`,
    card,
    owner,
    lastControlledBy: owner,
    controlledSince: state.turn,
    ready: true,
    damage: 0,
    runes: 0,
    level: 1,
    thisTurn: {}
  };
  state.entities[newHero.id] = newHero;
  state.nextId++;
  applyStateBasedEffects(state);
  return newHero.id;
}

export function killEntity(state, entityId) {
  const e = state.entities[entityId];
  const vals = getCurrentValues(state, entityId);
  log.add(state, log.fmt`${getName(state, entityId)} dies.`);
  delete state.entities[entityId];
  const pz = state.players[vals.controller].patrollerIds;
  pz.forEach((id, index) => {
    if (id == entityId) {
      if (index == patrolSlots.scavenger) {
        state.newTriggers.push({
          path: "triggerInfo.scavenger",
          playerId: vals.controller
        });
      }
      if (index == patrolSlots.technician) {
        state.newTriggers.push({
          path: "triggerInfo.technician",
          playerId: vals.controller
        });
      }
      pz[index] = null;
    }
  });
  if (vals.type == types.hero) {
    state.players[e.owner].commandZone.push(e.card);
  } else {
    state.updateHidden(fs => {
      fs.players[e.owner].discard.push(e.card);
    });
  }
}

export function getName(state, entityId) {
  // should be deprecated eventually
  return state.entities[entityId].current.name;
}

export function getCurrentController(state, unitIds) {
  // It turns out this should never have existed, eventually it should
  // be deprecated
  let shouldReturnSingleton = false;
  if (!Array.isArray(unitIds)) {
    unitIds = [unitIds];
    shouldReturnSingleton = true;
  }
  const result = {};
  forEach(state.entities, (u, id) => {
    if (unitIds.includes(id)) {
      result[id] = u.owner; // u.current.controller;
    }
  });
  return shouldReturnSingleton ? result[unitIds] : result;
}

export function getCurrentValues(state, unitIds) {
  // should be deprecated eventually
  let shouldReturnSingleton = false;
  if (!Array.isArray(unitIds)) {
    unitIds = [unitIds];
    shouldReturnSingleton = true;
  }
  const result = {};
  // currently we do each unit separately but we handle requesting several at once
  // because of the future case where we need to check all copy effects to see if
  // they have added or removed a global effect from a unit
  forEach(state.entities, (u, id) => {
    if (unitIds.includes(id)) {
      result[id] = u.current;
    }
  });
  return shouldReturnSingleton ? result[unitIds] : result;
}

function getLevelValuesForHero(u, printedValues) {
  const band =
    u.level >= printedValues.maxbandLevel
      ? 2
      : u.level >= printedValues.midbandLevel
      ? 1
      : 0;
  const result = {
    ...printedValues,
    ...printedValues.bands[band],
    abilities: []
  };
  for (let b = 0; b <= band; b++) {
    (printedValues.bands[b].abilities || []).forEach((a, index) => {
      result.abilities.push({
        ...a,
        path: `cardInfo.${u.card}.bands[${b}].abilities[${index}]`
      });
    });
  }
  return result;
}

export function conferKeyword(entity, kwAbility) {
  entity.current.abilities.push(kwAbility);
}

export function conferComplexAbility(entity, path) {
  const ability = get(triggerDefinitions, path);
  entity.current.abilities.push({ ...ability, path });
}

export function clearCurrentValues(state) {
  forEach(state.entities, e => {
    e.current = undefined;
  });
  state.currentCache = undefined;
}

export function cacheCurrentValues(state) {
  if (state.started && !state.currentCache) {
    updateCurrentValues(state);
  }
}

export function updateCurrentValues(state) {
  state.currentCache = true;
  // 1. Start with a draft based on each entity's printed values
  forEach(state.entities, e => {
    let printedValues =
      e.card == undefined ? fixtures[e.fixture] : cardInfo[e.card];
    // 1a. tokens 1b. dancers
    if (printedValues.type == types.hero) {
      printedValues = getLevelValuesForHero(e, printedValues);
    }
    e.current = createDraft(printedValues);
    e.current.controller = e.owner;
    e.current.subtypes = e.current.subtypes || [];
    e.current.abilities = e.current.abilities || [];
    if (e.current.type != types.hero) {
      e.current.abilities.forEach((a, index) => {
        a.path = `cardInfo.${e.card}.abilities[${index}]`;
      });
    }
  });
  forEach(state.entities, e => {
    // 2. chaos mirror, polymorph: squirrel and copy effects
    // 3. effects that set ATK and DEF to specific values (i.e. faerie dragon)
    // 4. ability-gaining effects that don't depend on ATK or HP
    // 5. apply bonuses or penalties to ATK or HP from runes, entities and effects
    // (note: order does not matter in this step)
    if (e.current.type == types.unit || e.current.type == types.hero) {
      e.current.attack += e.runes;
      e.current.hp += e.runes;
    }
    forEach(e.current.abilities, a => {
      if (a.modifyOwnValues) {
        a.modifyOwnValues({
          state,
          self: e
        });
      }
    });
    forEach(state.entities, other => {
      // also at the moment we can just use the printed values here
      if (other.card) {
        // fixtures don't have global passives
        forEach(cardInfo[other.card].abilities, a => {
          if (a.modifyGlobalValues) {
            a.modifyGlobalValues({
              state,
              self: other,
              other: e
            });
          }
        });
      }
    });
    if (
      state.players[e.current.controller].patrollerIds[patrolSlots.elite] ==
      e.id
    ) {
      e.current.attack += 1;
    }
    // 6. reset negative ATK and HP to 0
    // 6a. pestering haunt
    // 7. conditional ability-gaining effects
    e.current.attack = e.current.attack > 0 ? e.current.attack : 0;
    e.current.hp = e.current.hp > 0 ? e.current.hp : 0;
  });
  // Values have been computed so finalise the drafts
  forEach(state.entities, e => {
    e.current = finishDraft(e.current);
    if (e.current.controller != e.lastControlledBy) {
      e.controlledSince = state.turn;
      e.lastControlledBy = e.current.controller;
    }
  });
}

export function applyStateBasedEffects(state) {
  let stable = false;
  while (!stable) {
    stable = true;
    updateCurrentValues(state);
    forEach(state.entities, u => {
      if (u.damage >= u.current.hp) {
        killEntity(state, u.id);
        stable = false;
      }
    });
  }
}
