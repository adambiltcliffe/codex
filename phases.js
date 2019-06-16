import { andJoin, getAP } from "./util";
import log from "./log";
import cardInfo from "./cardinfo";
import forEach from "lodash/forEach";

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
  enterReadyPhase(state);
}

export function enterReadyPhase(state) {
  state.phase = phases.ready;
  state.madeWorkerThisTurn = false;
  const ap = getAP(state);
  const readied = [];
  forEach(state.units, u => {
    if (u.controller == ap.id && !u.ready) {
      readied.push(cardInfo[u.card].name);
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
  const oldGold = ap.gold;
  ap.gold += ap.workers;
  if (ap.gold > 20) {
    ap.gold = 20;
  }
  log.add(state, log.fmt`${ap} gains ${ap.gold - oldGold} gold from workers.`);
  forEach(state.units, u => {
    if (u.controller == ap.id) {
      forEach(cardInfo[u.card].abilities, a => {
        if (a.upkeepTrigger) {
          a.upkeepTrigger({ state, thisUnit: u });
        }
      });
    }
  });
}

export function enterMainPhase(state) {
  state.phase = phases.main;
}
