import { TestGame, testp1Id, testp2Id } from "../testutil";
import { getAttackableEntityIds } from "../actions/attack";

test("Chameleon can sneak past patrollers", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["iron_man", "iron_man"])
    .insertEntity(testp2Id, "chameleon");
  const [im1, im2, cm] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playAction({ type: "endTurn", patrollers: [im1, im2, null, null, null] });
  expect(() =>
    tg.checkAction({ type: "attack", attacker: cm, target: im1 })
  ).not.toThrow();
  expect(() =>
    tg.checkAction({ type: "attack", attacker: cm, target: im2 })
  ).not.toThrow();
  expect(() =>
    tg.checkAction({ type: "attack", attacker: cm, target: p1base })
  ).not.toThrow();
  expect(
    getAttackableEntityIds(tg.state, tg.state.entities[cm].current).sort()
  ).toEqual([im1, im2, p1base].sort());
});
