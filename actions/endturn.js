import { knuthShuffle } from "knuth-shuffle";

export function checkEndTurnAction(state, action) {
  // nothing to check until we have patrollers to lock in
}

export function doEndTurnAction(state, action) {
  state.updateHidden(fs => {
    const ap = fs.players[fs.playerList[fs.activePlayerIndex]];
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

  state.turn++;
  state.activePlayerIndex += 1;
  state.activePlayerIndex %= state.playerList.length;
}
