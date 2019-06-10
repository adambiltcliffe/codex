import { getAP } from "./util";
import log from "./log";

export function ready(state) {
  state.madeWorkerThisTurn = false;
}

export function upkeep(state) {
  const ap = getAP(state);
  const oldGold = ap.gold;
  ap.gold += ap.workers;
  if (ap.gold > 20) {
    ap.gold = 20;
  }
  log.add(state, log.fmt`${ap} gains ${ap.gold - oldGold} gold from workers.`);
}
