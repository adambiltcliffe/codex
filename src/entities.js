import produce from "immer";
import forEach from "lodash/forEach";
import cardInfo, { types } from "./cardinfo";
import fixtures from "./fixtures";
import log from "./log";
import { patrolSlots } from "./patrolzone";

export function checkState(state) {
  forEach(state.entities, u => {
    const vals = getCurrentValues(state, u.id);
    if (u.damage >= vals.hp) {
      killEntity(state, u.id);
    }
  });
}

export function killEntity(state, entityId) {
  const e = state.entities[entityId];
  const vals = getCurrentValues(state, entityId);
  log.add(state, log.fmt`${getName(state, entityId)} dies.`);
  delete state.entities[entityId];
  const pz = state.players[vals.controller].patrollerIds;
  pz.forEach((id, index) => {
    if (id == entityId) {
      pz[index] = null;
    }
  });
  state.updateHidden(fs => {
    fs.players[e.owner].discard.push(e.card);
  });
}

export function getName(state, entityId) {
  const entity = state.entities[entityId];
  if (entity.card) {
    return cardInfo[entity.card].name;
  } else {
    return fixtures[entity.fixture].name;
  }
}

export function getCurrentController(state, unitIds) {
  // Nothing can change a unit's controller yet, but we will need this
  // a bunch in future
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
      result[id] = u.owner;
    }
  });
  return shouldReturnSingleton ? result[unitIds] : result;
}

export function getCurrentValues(state, unitIds, attackTargetId) {
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
      // 1. Start with the printed values
      const printedValues =
        u.card == undefined ? fixtures[u.fixture] : cardInfo[u.card];
      // 1a. tokens 1b. dancers 1c. heroes
      const currentValues = produce(printedValues, draft => {
        draft.controller = u.owner;
        draft.abilities = draft.abilities || [];
        draft.subtypes = draft.subtypes || [];
        // 2. chaos mirror, polymorph: squirrel and copy effects
        // 3. effects that set ATK and DEF to specific values (i.e. faerie dragon)
        // 4. ability-gaining effects that don't depend on ATK or HP
        // 5. apply bonuses or penalties to ATK or HP from runes, entities and effects
        // (note: order does not matter in this step)
        // 6. reset negative ATK and HP to 0
        // 6a. pestering haunt
        // 7. conditional ability-gaining effects
        // at present we don't pay attention to effect order (because it doesn't matter)
        if (draft.type == types.unit || draft.type == types.hero) {
          draft.attack += u.runes;
          draft.hp += u.runes;
        }
        forEach(draft.abilities, a => {
          if (a.modifyOwnValues) {
            a.modifyOwnValues({
              state,
              self: u,
              values: draft,
              attackTargetId
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
                  source: other,
                  subject: u,
                  values: draft,
                  attackTargetId
                });
              }
            });
          }
        });
        if (
          state.players[draft.controller].patrollerIds[patrolSlots.elite] == id
        ) {
          draft.attack += 1;
        }
        draft.attack = draft.attack > 0 ? draft.attack : 0;
        draft.hp = draft.hp > 0 ? draft.hp : 0;
      });
      if (currentValues.controller != u.lastControlledBy) {
        u.controlledSince = state.turn;
        u.lastControlledBy = currentValues.controller;
      }
      result[id] = currentValues;
    }
  });
  return shouldReturnSingleton ? result[unitIds] : result;
}
