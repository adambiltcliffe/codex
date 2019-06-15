import { getNewGame } from "./testutil";
import CodexGame from "./codex";

test("Workers generate gold during upkeep", () => {
  const s0 = getNewGame();
  expect(s0.activePlayerIndex).toEqual(0);
  expect(s0.players["player1"].gold).toEqual(4);
  expect(s0.players["player2"].gold).toEqual(0);
  const { state: s1 } = CodexGame.playAction(s0, {
    type: "endTurn"
  });
  expect(s1.activePlayerIndex).toEqual(1);
  expect(s1.players["player1"].gold).toEqual(4);
  expect(s1.players["player2"].gold).toEqual(5);
  const { state: s2 } = CodexGame.playAction(s1, {
    type: "endTurn"
  });
  expect(s2.activePlayerIndex).toEqual(0);
  expect(s2.players["player1"].gold).toEqual(8);
  expect(s2.players["player2"].gold).toEqual(5);
});
