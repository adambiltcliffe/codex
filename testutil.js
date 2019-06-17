import CodexGame from "./codex";
import pickBy from "lodash/pickby";

export const testp1Id = "test_player1";
export const testp2Id = "test_player2";

export function getNewGame() {
  const playerList = [testp1Id, testp2Id];
  const { state } = CodexGame.playAction({ playerList }, { type: "start" });
  return state;
}

export function putCardInHand(state, player, card) {
  state.players[player].hand.push(card);
}

export function playActions(initialState, actionList) {
  let state = initialState;
  actionList.forEach(a => {
    CodexGame.checkAction(state, a);
    ({ state } = CodexGame.playAction(state, a));
  });
  return state;
}

export function findUnitIds(state, predicate) {
  return Object.keys(pickBy(state.units, predicate));
}

export function findTriggerIndices(state, predicate) {
  return Object.keys(pickBy(state.newTriggers, predicate)).map(Number);
}
