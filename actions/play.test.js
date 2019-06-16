import CodexGame from "../codex";
import { findUnitIds, getNewGame, putCardInHand, testp1Id } from "../testutil";

test("Can put units into play", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "iron_man");
  expect(s0.units).toEqual({});
  const { state: s1 } = CodexGame.playAction(s0, {
    type: "play",
    card: "iron_man"
  });
  expect(
    findUnitIds(s1, u => u.controller == testp1Id && u.card == "iron_man")
      .length
  ).toEqual(1);
});