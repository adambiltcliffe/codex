import { TestGame, testp1Id } from "./testutil";
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
