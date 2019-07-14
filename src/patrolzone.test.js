import {
  getGameWithUnits,
  playActions,
  testp1Id,
  findEntityIds
} from "./testutil";
import CodexGame from "./codex";
import { fixtureNames } from "./fixtures";
import { getCurrentValues } from "./entities";

test("Attacking various combinations of patrollers", () => {
  const s0 = getGameWithUnits(
    ["tenderfoot", "helpful_turtle", "fruit_ninja"],
    ["older_brother"]
  );
  const tf = findEntityIds(s0, e => e.card == "tenderfoot")[0];
  const ob = findEntityIds(s0, e => e.card == "older_brother")[0];
  const ht = findEntityIds(s0, e => e.card == "helpful_turtle")[0];
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const s1a = playActions(s0, [
    {
      type: "endTurn",
      patrollers: [tf, ht, null, null, null]
    }
  ]);
  expect(() =>
    CodexGame.checkAction(s1a, { type: "attack", attacker: ob, target: tf })
  ).not.toThrow();
  expect(() =>
    CodexGame.checkAction(s1a, { type: "attack", attacker: ob, target: ht })
  ).toThrow();
  expect(() =>
    CodexGame.checkAction(s1a, { type: "attack", attacker: ob, target: p1base })
  ).toThrow();
  const s1b = playActions(s0, [
    {
      type: "endTurn",
      patrollers: [null, ht, tf, null, null]
    }
  ]);
  expect(() =>
    CodexGame.checkAction(s1b, { type: "attack", attacker: ob, target: tf })
  ).not.toThrow();
  expect(() =>
    CodexGame.checkAction(s1b, { type: "attack", attacker: ob, target: ht })
  ).not.toThrow();
  expect(() =>
    CodexGame.checkAction(s1b, { type: "attack", attacker: ob, target: p1base })
  ).toThrow();
});

test("Elite patroller gets +1 ATK", () => {
  const s0 = getGameWithUnits(["older_brother"], []);
  const ob = findEntityIds(s0, e => e.card == "older_brother")[0];
  expect(getCurrentValues(s0, ob).attack).toEqual(2);
  const s1 = playActions(s0, [
    { type: "endTurn", patrollers: [null, ob, null, null, null] }
  ]);
  expect(getCurrentValues(s1, ob).attack).toEqual(3);
  const s2 = playActions(s1, [{ type: "endTurn" }]);
  expect(getCurrentValues(s2, ob).attack).toEqual(2);
});
