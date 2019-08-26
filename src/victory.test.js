import { TestGame, testp2Id, testp1Id } from "./testutil";

test("Destroying the opponent's base wins the game", () => {
  const tg = new TestGame().insertEntity(testp1Id, "timely_messenger");
  const p2base = tg.findBaseId(testp2Id);
  const [tm] = tg.insertedEntityIds;
  tg.modifyEntity(p2base, { damage: 19 }).playAction({
    type: "attack",
    attacker: tm,
    target: p2base
  });
  expect(tg.state.result).toEqual({ winner: testp1Id });
  expect(tg.state.log).toContain(`\${${testp1Id}} wins the game.`);
  expect(() => tg.checkAction({ type: "endTurn" })).toThrow("ended");
});
