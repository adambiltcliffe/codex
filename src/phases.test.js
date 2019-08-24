import {
  getNewGame,
  putCardInHand,
  testp1Id,
  testp2Id,
  playActions,
  findEntityIds
} from "./testutil";
import CodexGame from "./game";

test("Workers generate gold during upkeep", () => {
  const s0 = getNewGame();
  expect(s0.activePlayerIndex).toEqual(0);
  expect(s0.players[testp1Id].gold).toEqual(4);
  expect(s0.players[testp2Id].gold).toEqual(0);
  const { state: s1 } = CodexGame.playAction(s0, {
    type: "endTurn"
  });
  expect(s1.activePlayerIndex).toEqual(1);
  expect(s1.players[testp1Id].gold).toEqual(4);
  expect(s1.players[testp2Id].gold).toEqual(5);
  const { state: s2 } = CodexGame.playAction(s1, {
    type: "endTurn"
  });
  expect(s2.activePlayerIndex).toEqual(0);
  expect(s2.players[testp1Id].gold).toEqual(8);
  expect(s2.players[testp2Id].gold).toEqual(5);
});

test("Units become exhausted when attacking and ready next turn", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "older_brother");
  putCardInHand(s0, testp2Id, "tenderfoot");
  const s1 = playActions(s0, [
    { type: "play", card: "older_brother" },
    { type: "endTurn" },
    { type: "play", card: "tenderfoot" },
    { type: "endTurn" }
  ]);
  const attackerId = findEntityIds(s1, u => u.card == "older_brother")[0];
  const targetId = findEntityIds(s1, u => u.card == "tenderfoot")[0];
  const s2 = playActions(s1, [
    { type: "attack", attacker: attackerId, target: targetId }
  ]);
  expect(s2.entities[attackerId].ready).toBeFalsy();
  const s3 = playActions(s2, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(s3.entities[attackerId].ready).toBeTruthy();
  expect(s3.log).toContain(`\${${testp1Id}} readies Older Brother.`);
});
