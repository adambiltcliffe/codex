import { andJoin, getAP } from "./util";
import log from "./log";
import cardInfo from "./cardinfo";
import forEach from "lodash/forEach";

export function ready(state) {
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

export function upkeep(state) {
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
