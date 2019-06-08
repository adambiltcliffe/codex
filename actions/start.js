import { knuthShuffle } from "knuth-shuffle";

function initialisePlayerState(state, p) {
  state.updateHidden(fs => {
    const deck = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    knuthShuffle(deck);
    const hand = deck.splice(0, 5);
    fs.players[p] = { hand, deck };
  });
}

export function checkStartAction(state, action) {
  if (state.started) {
    throw new Error("Game already started");
  }
}

export function doStartAction(state, action) {
  state.started = true;
  state.activePlayerIndex = 0;
  state.players = {};
  for (let ii = 0; ii < state.playerList.length; ii++) {
    initialisePlayerState(state, state.playerList[ii]);
  }
}
