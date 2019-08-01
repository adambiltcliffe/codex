import CodexGame from "./codex";
import pickBy from "lodash/pickby";
import cardInfo, { types } from "./cardinfo";
import produce from "immer";
import { createUnit, createHero } from "./entities";

export const testp1Id = "test_player1";
export const testp2Id = "test_player2";

export function getNewGame() {
  const playerList = [testp1Id, testp2Id];
  const { state } = CodexGame.playAction({ playerList }, { type: "start" });
  return state;
}

// Currently just an alias, but we might want to expand on this
export const getTestGame = getNewGame;

export function putCardInHand(state, player, card) {
  state.players[player].hand.push(card);
}

export function withCardsInHand(state, p1cards, p2cards) {
  return produce(state, draft => {
    p1cards.forEach(c => draft.players[testp1Id].hand.push(c));
    p2cards.forEach(c => draft.players[testp2Id].hand.push(c));
  });
}

export function withInsertedEntity(state, owner, card) {
  let newId = null;
  const newState = produce(state, draft => {
    switch (cardInfo[card].type) {
      case types.unit:
        newId = createUnit(draft, owner, card);
        break;
      case types.hero:
        newId = createHero(draft, owner, card);
        break;
    }
  });
  return [newState, newId];
}

export function withInsertedEntities(state, owner, cards) {
  let newIds = [];
  let newState = state;
  let latestId = null;
  cards.forEach(c => {
    [newState, latestId] = withInsertedEntity(newState, owner, c);
    newIds.push(latestId);
  });
  return [newState, newIds];
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
