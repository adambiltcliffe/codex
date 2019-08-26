import { getNewGame, playActions, testp1Id, TestGame } from "../testutil";
import { wrapSecret } from "../targets";

test("Making a worker increases gold generated in upkeep", () => {
  const s0 = getNewGame();
  expect(s0.players[testp1Id].gold).toEqual(4);
  const sWithoutWorker = playActions(s0, [
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  expect(sWithoutWorker.players[testp1Id].gold).toEqual(8);
  const sWithWorker1 = playActions(s0, [{ type: "worker", handIndex: 0 }]);
  expect(sWithWorker1.players[testp1Id].gold).toEqual(3);
  const sWithWorker2 = playActions(sWithWorker1, [
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  expect(sWithWorker2.players[testp1Id].gold).toEqual(8);
});

test("Correct card is removed when obscuring which card was workered", () => {
  const tg = new TestGame();
  const cardToWorker = tg.state.players[testp1Id].hand[2];
  const obscuredIndex = wrapSecret(
    tg.state,
    testp1Id,
    2,
    tg.state.players[testp1Id].hand.length
  );
  tg.playAction({ type: "worker", handIndex: obscuredIndex });
  expect(tg.state.players[testp1Id].hand).not.toContain(cardToWorker);
});
