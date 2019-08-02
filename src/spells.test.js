import {
  getTestGame,
  withInsertedEntity,
  testp1Id,
  testp2Id,
  playActions,
  withCardsInHand
} from "./testutil";

test("Spells go into the discard after resolving", () => {
  const s0 = withCardsInHand(getTestGame(), ["wither"], []);
  const [s1, troq] = withInsertedEntity(s0, testp1Id, "troq_bashar");
  const [s2, tm] = withInsertedEntity(s1, testp2Id, "timely_messenger");
  expect(s2.players[testp1Id].discard).not.toContain("wither");
  const s3 = playActions(s2, [{ type: "play", card: "wither" }]);
  expect(s3.players[testp1Id].discard).not.toContain("wither");
  const s4 = playActions(s3, [{ type: "choice", target: tm }]);
  expect(s4.players[testp1Id].discard).toContain("wither");
});
