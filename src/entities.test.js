import { TestGame, testp1Id, testp2Id } from "./testutil";
import { hasKeyword, haste } from "./cardinfo/abilities/keywords";
import { fixtureNames } from "./fixtures";

test("Destroying an entity with a 'destroy' effect updates state", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["the_boot"])
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, ["nimble_fencer", "tenderfoot"]);
  const [troq, nf, tf] = tg.insertedEntityIds;
  expect(hasKeyword(tg.state.entities[tf].current, haste)).toBeTruthy();
  tg.playActions([
    { type: "play", card: "the_boot" },
    { type: "choice", target: nf }
  ]);
  expect(hasKeyword(tg.state.entities[tf].current, haste)).toBeFalsy();
});

test("Destroying a building deals 2 damage to base", () => {
  const tg = new TestGame()
    .insertFixture(testp1Id, fixtureNames.surplus)
    .insertEntity(testp2Id, "regularsized_rhinoceros");
  const p1base = tg.findBaseId(testp1Id);
  const [surp, rr] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: rr, target: surp }
  ]);
  expect(tg.state.entities[p1base].damage).toEqual(2);
  expect(tg.state.log).toContain("Base takes 2 damage.");
});

test("Game ends when a player's base is reduced to 0hp", () => {
  const tg = new TestGame().insertEntity(testp1Id, "timely_messenger");
  const [tm] = tg.insertedEntityIds;
  const p2base = tg.findBaseId(testp2Id);
  expect(tg.state.result).toBeUndefined();
  tg.modifyEntity(p2base, { damage: 19 }).playAction({
    type: "attack",
    attacker: tm,
    target: p2base
  });
  expect(tg.state.result).toEqual({ winner: testp1Id });
  expect(tg.state.log).toContain(`\${${testp1Id}} wins the game.`);
});
