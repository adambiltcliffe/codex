import CodexGame from "../codex";

test("Can start a game", () => {
  const pregameState = { playerList: ["player1", "player2"] };
  expect(() =>
    CodexGame.checkAction(pregameState, { type: "start" })
  ).not.toThrow();
  const { state } = CodexGame.playAction(pregameState, { type: "start" });
  expect(state).toHaveProperty("players");
  expect(state).toHaveProperty("players.player1");
  expect(state).toHaveProperty("players.player2");
  expect(() => CodexGame.checkAction(state, { type: "start" })).toThrow();
});
