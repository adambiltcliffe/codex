import CodexGame from "../game";
import {
  findTriggerIndices,
  playActions,
  testp1Id,
  findEntityIds,
  TestGame
} from "../testutil";

import startsWith from "lodash/startsWith";
import { fixtureNames } from "../fixtures";

test("Can choose the order of triggers in the queue when they trigger together", () => {
  const s0 = new TestGame()
    .putCardsInHand(testp1Id, ["helpful_turtle", "starcrossed_starlet"])
    .insertFixture(testp1Id, fixtureNames.tech1)
    .setGold(testp1Id, 10).state;
  const s1 = playActions(s0, [
    { type: "play", card: "helpful_turtle" },
    { type: "play", card: "starcrossed_starlet" },
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  expect(s1.queue.length).toEqual(0);
  expect(s1.newTriggers.length).toEqual(2);
  expect(() => CodexGame.checkAction(s1, { type: "endTurn" })).toThrow();
  const turtleIndex = findTriggerIndices(s1, t =>
    startsWith(t.path, "cardInfo.helpful_turtle")
  )[0];
  const starletIndex = findTriggerIndices(s1, t =>
    startsWith(t.path, "cardInfo.starcrossed_starlet")
  )[0];
  const starletId = findEntityIds(s1, u => u.card == "starcrossed_starlet");
  expect(() =>
    CodexGame.checkAction(s1, { type: "queue", index: turtleIndex })
  ).not.toThrow();
  const s2a = playActions(s1, [{ type: "queue", index: turtleIndex }]);
  expect(s2a.entities[starletId].damage).toEqual(1);
  expect(() => CodexGame.checkAction(s2a, { type: "endTurn" })).not.toThrow();
  const s2b = playActions(s1, [{ type: "queue", index: starletIndex }]);
  expect(s2b.entities[starletId].damage).toEqual(0);
  expect(() => CodexGame.checkAction(s2b, { type: "endTurn" })).not.toThrow();
});
