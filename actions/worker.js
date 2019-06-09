import { getAP } from "../util";

export function checkWorkerAction(state, action) {
  const ap = getAP(state);
  if (ap.gold == 0) {
    throw new Error("No gold to make a worker");
  }
  if (
    typeof action.handIndex != "number" ||
    action.handIndex >= ap.hand.length
  ) {
    throw new Error("Invalid index for card to use");
  }
  if (state.madeWorkerThisTurn) {
    throw new Error("Already made a worker this turn");
  }
}

export function doWorkerAction(state, action) {
  state.updateHidden(fs => {
    const ap = getAP(fs);
    ap.hand.splice(action.handIndex, 1);
  });
  const ap = getAP(state);
  ap.workers += 1;
  ap.gold -= 1;
  state.madeWorkerThisTurn = true;
}
