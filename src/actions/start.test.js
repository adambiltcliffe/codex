import CodexGame from "../game";
import { testp1Id, testp2Id } from "../testutil";
import { specs } from "../cardinfo";

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

test("Correct cards in deck, codex and command zone (1 hero game)", () => {
  const pregameState = { playerList: [testp1Id, testp2Id] };
  const startAction = {
    type: "start",
    specs: { [testp1Id]: [specs.bashing], [testp2Id]: [specs.bashing] }
  };
  const { state } = CodexGame.playAction(pregameState, startAction);
  const p1 = state.players[testp1Id];
  expect(
    p1.deck.includes("brick_thief") || p1.hand.includes("brick_thief")
  ).toBeTruthy();
  expect(p1.deck.length).toEqual(5);
  expect(p1.hand.length).toEqual(5);
  expect(p1.commandZone).toEqual(["troq_bashar"]);
  expect(p1.codex.length).toEqual(12);
  expect(p1.codex[0]).toEqual({ card: "wrecking_ball", n: 2 });
});

test("Validation for players' specs", () => {
  const pregameState = { playerList: [testp1Id, testp2Id] };
  const startAction = {
    type: "start",
    specs: { [testp1Id]: ["Bashing"], [testp2Id]: ["Finesse"] }
  };
  expect(() => CodexGame.checkAction(pregameState, startAction)).toThrow();
});
