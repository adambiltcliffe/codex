import CodexGame from "../codex";
import { getNewGame, putCardInHand } from "../testutil";

test("Can put units into play", () => {
  const s0 = getNewGame();
  const nextId = s0.nextUnitId;
  putCardInHand(s0, "player1", "iron_man");
  expect(s0.units).toEqual({});
  const { state: s1 } = CodexGame.playAction(s0, {
    type: "play",
    card: "iron_man"
  });
  expect(s1.units[nextId]).not.toBeNull();
  expect(s1.units[nextId].card).toEqual("iron_man");
});
