import { wrapSecret, wrapSecrets } from "../targets";
import { getAP } from "../util";

export function makeWorkerAction(state, realHandIndex) {
  const ap = getAP(state);
  const obscuredIndex = wrapSecret(
    state,
    ap.id,
    realHandIndex,
    state.players[ap.id].hand.length
  );
  return { type: "worker", handIndex: obscuredIndex };
}

export function makeTechChoiceAction(state, realCodexIndices) {
  const ap = getAP(state);
  const obscuredIndices = wrapSecrets(
    state,
    ap.id,
    realCodexIndices,
    state.players[ap.id].codex.length
  );
  return { type: "choice", indices: obscuredIndices };
}
