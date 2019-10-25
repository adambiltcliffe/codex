import { TestGame, testp1Id } from "../testutil";
import { makeWorkerAction, makeTechChoiceAction } from "./secrets";
import { buildSingleCodex } from "../codex";
import { specs } from "../cardinfo";

test("Correct card is removed when obscuring which card was workered", () => {
  const tg = new TestGame();
  const cardToWorker = tg.state.players[testp1Id].hand[2];
  const act = makeWorkerAction(tg.state, 2);
  tg.playAction(act);
  expect(tg.state.players[testp1Id].hand).not.toContain(cardToWorker);
});

test("Correct card is teched when choosing from codex", () => {
  const tg = new TestGame()
    .setCodex(testp1Id, buildSingleCodex(specs.bashing))
    .playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  expect(tg.state.currentTrigger.path).toEqual("triggerInfo.tech");
  const act = makeTechChoiceAction(tg.state, [0, 11]);
  tg.playAction(act);
  expect(tg.state.players[testp1Id].discard[5]).toEqual("wrecking_ball");
  expect(tg.state.players[testp1Id].discard[6]).toEqual("trojan_duck");
});
