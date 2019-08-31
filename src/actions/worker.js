import log from "../log";
import { getAP } from "../util";
import { resetSecret, unwrapSecret } from "../targets";

export function checkWorkerAction(state, action) {
  const ap = getAP(state);
  if (ap.gold == 0) {
    throw new Error("No gold to make a worker");
  }
  if (!Number.isInteger(action.handIndex)) {
    throw new Error("Invalid index for card to use");
  }
  if (state.madeWorkerThisTurn) {
    throw new Error("Already made a worker this turn");
  }
  return true;
}

export function doWorkerAction(state, action) {
  state.updateHidden(fs => {
    const ap = getAP(fs);
    const realHandIndex = unwrapSecret(
      state,
      ap.id,
      action.handIndex,
      ap.hand.length
    );
    ap.hand.splice(realHandIndex, 1);
    resetSecret(fs, ap.id);
  });
  const ap = getAP(state);
  ap.workers += 1;
  ap.gold -= 1;
  state.madeWorkerThisTurn = true;
  log.add(state, log.fmt`${ap} buys a worker.`);
}
