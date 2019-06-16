import { getNewGame, playActions, testp1Id } from "../testutil";

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
