import { createDraft, finishDraft } from "immer";

import fixtures, { fixtureNames } from "./fixtures";
import log from "./log";
import { patrolSlots } from "./patrolzone";
import { triggerDefinitions } from "./triggers";
import { getEffectDefinition, expireEffects } from "./effects";
import cardInfo, { types } from "./cardinfo";

import get from "lodash/get";
import findKey from "lodash/findKey";
import forEach from "lodash/forEach";
import map from "lodash/map";
import min from "lodash/min";
import max from "lodash/max";
import upperFirst from "lodash/upperFirst";
import { getAP } from "./util";

export function createBuildingFixture(state, owner, fixture, suppressUpdate) {
  const newBuilding = {
    id: `e${state.nextId}`,
    fixture,
    owner,
    defaultController: owner,
    damage: 0,
    armor: 0,
    ready: true,
    effects: []
  };
  state.entities[newBuilding.id] = newBuilding;
  state.nextId++;
  if (!state.started || !suppressUpdate) {
    // We can't do this when creating bases during initialisation
    applyStateBasedEffects(state);
  }
  return newBuilding;
}

export function createUnit(state, owner, card) {
  const newUnit = {
    id: `e${state.nextId}`,
    card,
    owner,
    defaultController: owner,
    lastControlledBy: owner,
    controlledSince: state.turn,
    ready: true,
    damage: 0,
    armor: 0,
    runes: 0,
    effects: [],
    thisTurn: {}
  };
  state.entities[newUnit.id] = newUnit;
  state.nextId++;
  applyStateBasedEffects(state);
  return newUnit;
}

export function createHero(state, owner, card) {
  const newHero = {
    id: `e${state.nextId}`,
    card,
    owner,
    defaultController: owner,
    lastControlledBy: owner,
    controlledSince: state.turn,
    ready: true,
    damage: 0,
    armor: 0,
    runes: 0,
    level: 1,
    effects: [],
    thisTurn: {}
  };
  state.entities[newHero.id] = newHero;
  state.nextId++;
  applyStateBasedEffects(state);
  return newHero;
}

export function damageEntity(state, entity, damage) {
  if (damage.amount < 1) {
    return;
  }
  const sourceName = upperFirst(
    damage.isSpellDamage
      ? cardInfo[state.playedCard].name
      : damage.source.current.name
  );
  if (damage.source && damage.source == entity) {
    log.add(state, `${sourceName} deals ${damage.amount} damage to itself.`);
  } else {
    log.add(
      state,
      `${sourceName} deals ${damage.amount} damage to ${entity.current.name}.`
    );
  }
  if (damage.amount > entity.armor) {
    entity.damage += damage.amount - entity.armor;
    entity.armor = 0;
  } else {
    entity.armor -= damage.amount;
  }
}

export function bounceEntity(state, entityId) {
  const e = state.entities[entityId];
  const ci = cardInfo[e.card];
  const dest = ci.type == types.hero ? "command zone" : "hand";
  log.add(
    state,
    log.fmt`${e.current.name} is returned to ${
      state.players[e.owner]
    }'s ${dest}.`
  );
  delete state.entities[e.id];
  if (ci.type == types.hero) {
    state.players[e.owner].commandZone.push(e.card);
  } else {
    state.updateHidden(fs => {
      fs.players[e.owner].hand.push(e.card);
    });
  }
}

export function killEntity(state, entityId) {
  const e = state.entities[entityId];
  if (e.fixture == fixtureNames.base) {
    return false;
  }
  if (e.current.type == types.building) {
    log.add(state, `${upperFirst(e.current.name)} is destroyed.`);
    const base =
      state.entities[
        state.players[e.current.controller].current.fixtures[fixtureNames.base]
      ];
    log.add(state, `${upperFirst(base.current.name)} takes 2 damage.`);
    base.damage += 2;
  } else {
    log.add(state, log.fmt`${e.current.name} dies.`);
  }
  delete state.entities[e.id];
  const pz = state.players[e.current.controller].patrollerIds;
  pz.forEach((id, index) => {
    if (id == e.id) {
      if (index == patrolSlots.scavenger) {
        state.newTriggers.push({
          path: "triggerInfo.scavenger",
          playerId: e.current.controller
        });
      }
      if (index == patrolSlots.technician) {
        state.newTriggers.push({
          path: "triggerInfo.technician",
          playerId: e.current.controller
        });
      }
      pz[index] = null;
    }
  });
  if (e.current.type == types.hero) {
    state.newTriggers.push({
      path: "triggerInfo.heroDeath",
      playerId: e.current.controller
    });
  }
  // Now put the card in the appropriate place
  if (e.fixture === undefined) {
    if (cardInfo[e.card].type == types.hero) {
      state.players[e.owner].commandZone.push(e.card);
      state.players[e.owner].heroCooldowns[e.card] =
        e.owner == getAP(state).id ? 2 : 1;
    } else {
      state.updateHidden(fs => {
        fs.players[e.owner].discard.push(e.card);
      });
    }
  }
  return true;
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
  forEach(state.players, p => {
    p.current = undefined;
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
  forEach(state.players, p => {
    p.current = {
      heroColors: [],
      heroSpecs: [],
      ultimateSpecs: [],
      fixtures: {}
    };
  });
  // 1. Start with a draft based on each entity's printed values
  forEach(state.entities, e => {
    let printedValues =
      e.card == undefined ? fixtures[e.fixture] : cardInfo[e.card];
    // 1a. tokens 1b. dancers
    if (printedValues.type == types.hero) {
      printedValues = getLevelValuesForHero(e, printedValues);
    }
    e.current = createDraft(printedValues);
    e.current.controller = e.defaultController;
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
    forEach(e.effects, effectInfo => {
      const fxDef = getEffectDefinition(effectInfo);
      if (fxDef.modifySubjectValues) {
        fxDef.modifySubjectValues({ subject: e, effectInfo });
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
    // Cache summary info
    const pc = state.players[e.current.controller].current;
    if (e.current.type == types.hero) {
      pc.heroColors.push(e.current.color);
      pc.heroSpecs.push(e.current.spec);
      if (e.controlledSince < state.turn && e.maxedSince < state.turn) {
        pc.ultimateSpecs.push(e.current.spec);
      }
    } else if (e.fixture) {
      pc.fixtures[e.fixture] = e.id;
      if (fixtures[e.fixture].isAddOn) {
        pc.addOn = e.id;
      }
    }
  });
}

export function applyStateBasedEffects(state) {
  expireEffects(state);
  let stable = false;
  while (!stable) {
    stable = true;
    updateCurrentValues(state);
    forEach(state.entities, u => {
      if (u.damage >= u.current.hp) {
        const wasKilled = killEntity(state, u.id);
        stable &= !wasKilled;
      }
    });
  }
  checkForEndOfGame(state);
}

function checkForEndOfGame(state) {
  const baseDmg = map(
    state.players,
    p => state.entities[p.current.fixtures[fixtureNames.base]].damage
  );
  if (max(baseDmg) >=20 ) {
    const winner = findKey(
      state.players,
      p =>
        state.entities[p.current.fixtures[fixtureNames.base]].damage == min(baseDmg)
    );
    state.result = { winner };
    log.add(state, log.fmt`${state.players[winner]} wins the game.`);
  }
}
