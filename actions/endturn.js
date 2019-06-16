import { knuthShuffle } from "knuth-shuffle";
import { phases, advanceTurn } from "../phases";
import { getAP } from "../util";
import log from "../log";

export function checkEndTurnAction(state, action) {
  // nothing to check until we have patrollers to lock in
}

export function doEndTurnAction(state, action) {
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
  log.add(state, log.fmt`${getAP(state)} ends their main phase.`);
  advanceTurn(state);
}
