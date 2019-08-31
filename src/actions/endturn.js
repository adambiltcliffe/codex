import { phases, advanceTurn, doEndOfTurnEffects } from "../phases";
import { getCurrentValues, applyStateBasedEffects } from "../entities";
import { andJoin, getAP } from "../util";
import { types } from "../cardinfo/constants";
import log from "../log";
import { emptyPatrolZone, patrolSlotNames } from "../patrolzone";
import { doDrawPhase } from "../draw";

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
      if (patroller.current.controller != ap.id) {
        throw new Error("You don't control one of the patrollers.");
      }
      if (
        patroller.current.type != types.unit &&
        patroller.current.type != types.hero
      ) {
        throw new Error("Only units and heroes can patrol.");
      }
      if (!patroller.ready) {
        throw new Error("One of the patrollers is exhausted.");
      }
    }
  });
  return true;
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
  // have to do this because of "X while patrolling" and "X during your turn" effects
  applyStateBasedEffects(state);
  state.phase = phases.draw;
  // draw phase
  doDrawPhase(state);
  doEndOfTurnEffects(state);
  advanceTurn(state);
}
