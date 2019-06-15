import CodexGame from "./codex";

export function getNewGame() {
  const playerList = ["player1", "player2"];
  const { state } = CodexGame.playAction({ playerList }, { type: "start" });
  return state;
}

export function putCardInHand(state, player, card) {
  state.players[player].hand.push(card);
}
