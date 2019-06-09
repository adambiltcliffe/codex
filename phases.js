import { getAP } from "./util";

export function ready(state) {
  state.madeWorkerThisTurn = false;
}

export function upkeep(state) {
  const ap = getAP(state);
  ap.gold += ap.workers;
  if (ap.gold > 20) {
    ap.gold = 20;
  }
}
