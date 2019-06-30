import { knuthShuffle } from "knuth-shuffle";
import { phases, advanceTurn } from "../phases";
import { getCurrentValues } from "../entities";
import { andJoin, getAP } from "../util";
import { types } from "../cardinfo/constants";
import log from "../log";
import { emptyPatrolZone, patrolSlotNames } from "../patrolzone";

export function checkEndTurnAction(state, action) {
  if (action.patrollers === undefined) {
    return true;
  }
  if (!Array.isArray(action.patrollers) || action.patrollers.length != 5) {
    throw new Error("Patrollers must be an array of length 5.");
  }
  const ap = getAP(state);
  action.patrollers.forEach((id, index) => {
    if (id !== null) {
      for (let n = 0; n < index; n++) {
        if (action.patrollers[n] == id) {
          throw new Error("Patrollers array contains non-null duplicates.");
        }
      }
      const patroller = state.entities[id];
      if (typeof patroller != "object") {
        throw new Error("Invalid patroller ID.");
      }
      const patrollerVals = getCurrentValues(state, patroller.id);
      if (patrollerVals.controller != ap.id) {
        throw new Error("You don't control one of the patrollers.");
      }
      if (patrollerVals.type != types.unit) {
        throw new Error("Only units can patrol.");
      }
      if (!patroller.ready) {
        throw new Error("One of the patrollers is exhausted.");
      }
    }
  });
}

export function doEndTurnAction(state, action) {
  const ap = getAP(state);
  ap.patrollerIds = action.patrollers || emptyPatrolZone;
  const patrolling = ap.patrollerIds
    .map((id, slotIndex) => ({ id, slotIndex }))
    .filter(({ id }) => id !== null)
    .map(
      ({ id, slotIndex }) =>
        `${getCurrentValues(state, id).name} (${patrolSlotNames[slotIndex]})`
    );
  if (patrolling.length == 0) {
    log.add(state, log.fmt`${getAP(state)} ends their main phase.`);
  } else {
    log.add(
      state,
      log.fmt`${getAP(state)} ends their main phase, patrolling with ${andJoin(
        patrolling
      )}.`
    );
  }
  state.phase = phases.draw;
  // draw phase
  state.updateHidden(fs => {
    const ap = getAP(fs);
    const cardsToDraw = ap.hand.length >= 3 ? 5 : ap.hand.length + 2;
    ap.discard.push(...ap.hand);
    ap.hand = [];
    for (let ii = 0; ii < cardsToDraw; ii++) {
      if (ap.deck.length == 0) {
        if (ap.discard.length == 0) {
          break;
        }
        ap.deck.push(...ap.discard);
        ap.discard = [];
        knuthShuffle(ap.deck);
      }
      ap.hand.push(ap.deck.shift());
    }
  });
  advanceTurn(state);
}
