import produce from "immer";
import forEach from "lodash/forEach";
import cardInfo from "./cardinfo";
import log from "./log";

export function killUnits(state) {
  forEach(state.entities, u => {
    if (u.damage >= cardInfo[u.card].hp) {
      log.add(state, log.fmt`${cardInfo[u.card].name} dies.`);
      delete state.entities[u.id];
      state.updateHidden(fs => {
        fs.players[u.owner].discard.push(u.card);
      });
    }
  });
}

export function getCurrentValues(state, unitIds) {
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
    const currentValues = produce(cardInfo[u.card], draft => {
      forEach(draft.abilities, a => {
        if (a.modifyOwnValues) {
          a.modifyOwnValues({ state, self: u, values: draft });
        }
      });
    });
    result[id] = currentValues;
  });
  return shouldReturnSingleton ? result[unitIds] : result;
}
