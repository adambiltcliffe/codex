import CodexGame from "../codex";

test("Can start a game", () => {
  const { state } = CodexGame.playAction(
    { playerList: ["player1", "player2"] },
    { type: "start" }
  );
  expect(state).toHaveProperty("players");
  expect(state).toHaveProperty("players.player1");
  expect(state).toHaveProperty("players.player2");
});
