import { TestGame, testp2Id, testp1Id } from "./testutil";

import countBy from "lodash/countBy";

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

test("Winning the game is only reported once", () => {
  const tg = new TestGame().insertEntity(testp1Id, "trojan_duck");
  const p2base = tg.findBaseId(testp2Id);
  const [td] = tg.insertedEntityIds;
  tg.modifyEntity(td, { controlledSince: -1 })
    .modifyEntity(p2base, { damage: 10 })
    .playAction({
      type: "attack",
      attacker: td,
      target: p2base
    })
    .queueByPath("cardInfo.trojan_duck.abilities[1]")
    .playAction({ type: "choice", target: p2base });
  const winMessage = `\${${testp1Id}} wins the game.`;
  expect(countBy(tg.state.log)[winMessage]).toEqual(1);
});
