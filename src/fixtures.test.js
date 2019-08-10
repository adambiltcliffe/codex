import { TestGame, testp1Id, testp2Id } from "./testutil";
import { fixtureNames } from "./fixtures";

test("Surplus draws a card in upkeep", () => {
  const tg = new TestGame()
    .setGold(testp1Id, 5)
    .playActions([
      { type: "build", fixture: fixtureNames.surplus },
      { type: "endTurn" },
      { type: "endTurn" }
    ]);
  expect(tg.state.log).toContain(
    `\${${testp1Id}} reshuffles and draws 1 card from surplus.`
  );
  expect(tg.state.players[testp1Id].hand.length).toEqual(6);
});

test("Tower damages attackers", () => {
  const tg = new TestGame().insertEntities(testp2Id, [
    "older_brother",
    "timely_messenger"
  ]);
  const [ob, tm] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playActions([
    { type: "build", fixture: fixtureNames.tower },
    { type: "endTurn" }
  ]);
  expect(tg.state.log).toContain("Tower finishes construction.");
  tg.playAction({ type: "attack", attacker: ob, target: p1base });
  expect(tg.state.log).toContain("Tower deals 1 damage to Older Brother.");
  expect(tg.state.entities[ob].damage).toEqual(1);
  tg.playAction({ type: "attack", attacker: tm, target: p1base });
  expect(tg.state.log).toContain("Tower deals 1 damage to Timely Messenger.");
  expect(tg.state.entities[tm]).toBeUndefined();
});
