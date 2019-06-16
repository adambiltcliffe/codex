import CodexGame from "../codex";
import {
  findUnitIds,
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  testp2Id
} from "../testutil";

test("Arrival fatigue", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "iron_man");
  //const s1 =
  //expect(CodexGame.checkAction(s0, ));
});

test("Attacking 1/2s with other 1/2s", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "tenderfoot");
  putCardInHand(s0, testp1Id, "tenderfoot");
  putCardInHand(s0, testp2Id, "tenderfoot");
  const s1 = playActions(s0, [
    { type: "play", card: "tenderfoot" },
    { type: "play", card: "tenderfoot" },
    { type: "endTurn" },
    { type: "play", card: "tenderfoot" },
    { type: "endTurn" }
  ]);
  const attackerIds = findUnitIds(
    s1,
    u => u.controller == testp1Id && u.card == "tenderfoot"
  );
  expect(attackerIds).toHaveLength(2);
  const targetIds = findUnitIds(
    s1,
    u => u.controller == testp2Id && u.card == "tenderfoot"
  );
  expect(targetIds).toHaveLength(1);
  const oldDiscardSize = s1.players[testp2Id].discard.length;
  const s2 = playActions(s1, [
    { type: "attack", attacker: attackerIds[0], target: targetIds[0] }
  ]);
  expect(s2.units[attackerIds[0]].damage).toEqual(1);
  expect(s2.units[targetIds[0]].damage).toEqual(1);
  expect(s2.players[testp2Id].discard.length).toEqual(oldDiscardSize);
  const s3 = playActions(s2, [
    { type: "attack", attacker: attackerIds[1], target: targetIds[0] }
  ]);
  expect(s3.units[attackerIds[1]].damage).toEqual(1);
  expect(s3.units[targetIds[0]]).toBeUndefined();
  expect(s3.players[testp2Id].discard.length).toEqual(oldDiscardSize + 1);
});
