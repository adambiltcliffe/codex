import { andJoin, getAP, givePlayerGold } from "./util";
import log from "./log";
import forEach from "lodash/forEach";
import { getName, getCurrentValues, applyStateBasedEffects } from "./entities";
import { emptyPatrolZone } from "./patrolzone";

export const phases = {
  ready: "P_READY",
  upkeep: "P_UPKEEP",
  main: "P_MAIN",
  draw: "P_DRAW"
};

export function advanceTurn(state) {
  state.turn++;
  state.activePlayerIndex += 1;
  state.activePlayerIndex %= state.playerList.length;
  // have to do this because of "X during your turn" effects
  applyStateBasedEffects(state);
  enterReadyPhase(state);
}

export function advancePhase(state) {
  if (state.phase == phases.ready) {
    enterUpkeepPhase(state);
  } else if (state.phase == phases.upkeep) {
    enterMainPhase(state);
  }
}

export function enterReadyPhase(state) {
  state.phase = phases.ready;
  state.madeWorkerThisTurn = false;
  const ap = getAP(state);
  ap.patrollerIds = emptyPatrolZone;
  // have to do this because of "X while patrolling" effects
  applyStateBasedEffects(state);
  const readied = [];
  forEach(state.entities, u => {
    u.thisTurn = {};
    if (getCurrentValues(state, u.id).controller == ap.id && !u.ready) {
      readied.push(getName(state, u.id));
      u.ready = true;
    }
  });
  if (readied.length > 0) {
    log.add(state, log.fmt`${ap} readies ${andJoin(readied)}.`);
  }
}

export function enterUpkeepPhase(state) {
  state.phase = phases.upkeep;
  const ap = getAP(state);
  const workerGold = givePlayerGold(state, ap.id, ap.workers);
  log.add(state, log.fmt`${ap} gains ${workerGold} gold from workers.`);
  forEach(state.entities, u => {
    const vals = getCurrentValues(state, u.id);
    if (vals.controller == ap.id) {
      forEach(vals.abilities, (a, index) => {
        if (a.triggerOnUpkeep) {
          state.newTriggers.push({
            path: a.path,
            sourceId: u.id
          });
        }
      });
    }
  });
}

export function enterMainPhase(state) {
  state.phase = phases.main;
}
