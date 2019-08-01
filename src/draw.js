import { getAP, andJoin } from "./util";
import { knuthShuffle } from "knuth-shuffle";
import log from "./log";

function cardQuantity(n) {
  return `${n} card${n == 1 ? "" : "s"}`;
}

// only call this from within updateHidden()
function hiddenDrawCards(fs, p, n) {
  let drawn = 0;
  for (let ii = 0; ii < n; ii++) {
    if (p.deck.length == 0) {
      if (p.discard.length == 0) {
        break;
      }
      if (drawn > 0) {
        fs.drawResult.push(`draws ${cardQuantity(drawn)}`);
        drawn = 0;
      }
      fs.drawResult.push("reshuffles");
      p.deck.push(...p.discard);
      p.discard = [];
      knuthShuffle(p.deck);
    }
    p.hand.push(p.deck.shift());
    drawn += 1;
  }
  if (drawn > 0) {
    fs.drawResult.push(`draws ${cardQuantity(drawn)}`);
    drawn = 0;
  }
}

export function drawCards(state, playerId, num, logSuffix) {
  const player = state.players[playerId];
  state.drawResult = [];
  state.updateHidden(fs => {
    hiddenDrawCards(fs, player, num);
  });
  log.add(state, log.fmt`${player} ${andJoin(state.drawResult)}${logSuffix}.`);
}

export function doDrawPhase(state) {
  const ap = getAP(state);
  state.drawResult = [];
  state.updateHidden(fs => {
    const cardsToDraw = ap.hand.length >= 3 ? 5 : ap.hand.length + 2;
    ap.discard.push(...ap.hand);
    fs.drawResult.push(`discards ${cardQuantity(ap.hand.length)}`);
    ap.hand = [];
    hiddenDrawCards(fs, ap, cardsToDraw);
  });
  log.add(state, log.fmt`${ap} ${andJoin(state.drawResult)}.`);
}
