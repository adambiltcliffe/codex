import {
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  testp2Id,
  findUnitIds
} from "../testutil";

test("Helpful Turtle heals your units but not the enemy's", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "helpful_turtle");
  putCardInHand(s0, testp1Id, "tenderfoot");
  putCardInHand(s0, testp2Id, "tenderfoot");
  const s1 = playActions(s0, [
    { type: "play", card: "tenderfoot" },
    { type: "play", card: "helpful_turtle" },
    { type: "endTurn" },
    { type: "play", card: "tenderfoot" },
    { type: "endTurn" }
  ]);
  const attacker = findUnitIds(
    s1,
    u => u.controller == testp1Id && u.card == "tenderfoot"
  )[0];
  const target = findUnitIds(
    s1,
    u => u.controller == testp2Id && u.card == "tenderfoot"
  )[0];
  const s2 = playActions(s1, [{ type: "attack", attacker, target }]);
  expect(s2.units[attacker].damage).toEqual(1);
  expect(s2.units[target].damage).toEqual(1);
  const s3 = playActions(s2, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(s3.units[attacker].damage).toEqual(0);
  expect(s3.units[target].damage).toEqual(1);
  expect(s3.log).toContain("Helpful Turtle heals 1 damage from Tenderfoot.");
});

test("Star-Crossed Starlet kills herself after 2 turns", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "starcrossed_starlet");
  const s1 = playActions(s0, [
    { type: "play", card: "starcrossed_starlet" },
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  const scs = findUnitIds(s1, u => u.card == "starcrossed_starlet")[0];
  expect(s1.units[scs].damage).toEqual(1);
  expect(s1.log).toContain("Star-Crossed Starlet takes 1 damage.");
  const s2 = playActions(s1, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(s2.units[scs]).toBeUndefined();
  expect(s2.log).toContain("Star-Crossed Starlet dies.");
});
