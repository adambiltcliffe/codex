import {
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  findEntityIds
} from "../testutil";

test("Hired Stomper can kill itself with own trigger", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "hired_stomper");
  expect(s0.currentTrigger).toBeNull();
  const s1 = playActions(s0, [{ type: "play", card: "hired_stomper" }]);
  expect(s1.currentTrigger).not.toBeNull();
  const hs = findEntityIds(s1, e => e.card == "hired_stomper")[0];
  const s2 = playActions(s1, [{ type: "choice", targetId: hs }]);
  expect(s2.entities[hs]).toBeUndefined();
  expect(s2.log).toContain("Hired Stomper deals 3 damage to Hired Stomper.");
});
