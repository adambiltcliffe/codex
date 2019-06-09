import { knuthShuffle } from "knuth-shuffle";
import { upkeep, ready } from "../phases";

function initialisePlayerState(state, playerIndex) {
  const player = state.playerList[playerIndex];
  state.updateHidden(fs => {
    const deck = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    knuthShuffle(deck);
    const hand = deck.splice(0, 5);
    fs.players[player] = { hand, deck, discard: [] };
  });
  state.players[player].workers = playerIndex == 0 ? 4 : 5;
  state.players[player].gold = 0;
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
    initialisePlayerState(state, ii);
  }
  state.turn = 0;

  ready(state);
  upkeep(state);
}
