import CodexGame from "./codex";
import pickBy from "lodash/pickby";
import cardInfo from "./cardinfo";

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

export function getGameWithUnits(p1units, p2units) {
  const s0 = getNewGame();
  p1units.forEach(u => {
    putCardInHand(s0, testp1Id, u);
    s0.players[testp1Id].gold += cardInfo[u].cost;
  });
  p2units.forEach(u => {
    putCardInHand(s0, testp2Id, u);
    s0.players[testp2Id].gold += cardInfo[u].cost;
  });
  const s1 = playActions(s0, p1units.map(u => ({ type: "play", card: u })));
  const s2 = playActions(s1, [{ type: "endTurn" }]);
  const s3 = playActions(s2, p2units.map(u => ({ type: "play", card: u })));
  const s4 = playActions(s3, [{ type: "endTurn" }]);
  return s4;
}

export function playActions(initialState, actionList) {
  let state = initialState;
  actionList.forEach(a => {
    CodexGame.checkAction(state, a);
    ({ state } = CodexGame.playAction(state, a));
  });
  return state;
}

export function findEntityIds(state, predicate) {
  return Object.keys(pickBy(state.entities, predicate));
}

export function findTriggerIndices(state, predicate) {
  return Object.keys(pickBy(state.newTriggers, predicate)).map(Number);
}
