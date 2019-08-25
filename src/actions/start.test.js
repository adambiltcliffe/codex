import CodexGame from "../game";

test("Can start a game", () => {
  const pregameState = { playerList: ["player1", "player2"] };
  const startAction = { type: "start", specs: { player1: [], player2: [] } };
  expect(() => CodexGame.checkAction(pregameState, startAction)).not.toThrow();
  const { state } = CodexGame.playAction(pregameState, startAction);
  expect(state).toHaveProperty("players");
  expect(state).toHaveProperty("players.player1");
  expect(state).toHaveProperty("players.player2");
  expect(() => CodexGame.checkAction(state, startAction)).toThrow();
});
