import {
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  findEntityIds
} from "../testutil";

test("Star-Crossed Starlet kills herself after 2 turns", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "starcrossed_starlet");
  const s1 = playActions(s0, [
    { type: "play", card: "starcrossed_starlet" },
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  const scs = findEntityIds(s1, u => u.card == "starcrossed_starlet")[0];
  expect(s1.entities[scs].damage).toEqual(1);
  expect(s1.log).toContain("Star-Crossed Starlet takes 1 damage.");
  const s2 = playActions(s1, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(s2.entities[scs]).toBeUndefined();
  expect(s2.log).toContain("Star-Crossed Starlet dies.");
});
