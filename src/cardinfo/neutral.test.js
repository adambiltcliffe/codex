import {
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  testp2Id,
  findEntityIds
} from "../testutil";
import { getCurrentValues } from "../entities";

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
  const attacker = findEntityIds(
    s1,
    u => u.owner == testp1Id && u.card == "tenderfoot"
  )[0];
  const target = findEntityIds(
    s1,
    u => u.owner == testp2Id && u.card == "tenderfoot"
  )[0];
  const s2 = playActions(s1, [{ type: "attack", attacker, target }]);
  expect(s2.entities[attacker].damage).toEqual(1);
  expect(s2.entities[target].damage).toEqual(1);
  const s3 = playActions(s2, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(s3.entities[attacker].damage).toEqual(0);
  expect(s3.entities[target].damage).toEqual(1);
  expect(s3.log).toContain("Helpful Turtle heals 1 damage from Tenderfoot.");
});

test("Fruit Ninja's frenzy functions correctly", () => {
  const s0 = getNewGame();
  s0.players[testp1Id].gold = 20;
  s0.players[testp2Id].gold = 20;
  putCardInHand(s0, testp1Id, "fruit_ninja");
  putCardInHand(s0, testp2Id, "iron_man");
  putCardInHand(s0, testp1Id, "fruit_ninja");
  putCardInHand(s0, testp2Id, "iron_man");
  const s1 = playActions(s0, [
    { type: "play", card: "fruit_ninja" },
    { type: "play", card: "fruit_ninja" }
  ]);
  const fns = findEntityIds(s1, u => u.card == "fruit_ninja");
  expect(getCurrentValues(s1, fns[0]).attack).toEqual(3);
  const s2 = playActions(s1, [
    { type: "endTurn" },
    { type: "play", card: "iron_man" },
    { type: "play", card: "iron_man" }
  ]);
  const ims = findEntityIds(s2, u => u.card == "iron_man");
  expect(getCurrentValues(s2, fns[0]).attack).toEqual(2);
  const s3 = playActions(s2, [
    { type: "endTurn" },
    { type: "attack", attacker: fns[0], target: ims[0] }
  ]);
  expect(s3.entities[ims[0]].damage).toEqual(3);
  const s4 = playActions(s3, [
    { type: "endTurn" },
    { type: "attack", attacker: ims[1], target: fns[1] }
  ]);
  expect(s4.entities[ims[1]].damage).toEqual(2);
});
