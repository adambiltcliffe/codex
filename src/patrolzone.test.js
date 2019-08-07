import {
  getGameWithUnits,
  playActions,
  testp1Id,
  findEntityIds,
  getTestGame,
  withInsertedEntities,
  withInsertedEntity,
  testp2Id,
  withCardsInHand,
  withGoldSetTo,
  TestGame
} from "./testutil";
import CodexGame from "./codex";
import { fixtureNames } from "./fixtures";
import { getCurrentValues } from "./entities";
import forEach from "lodash/forEach";

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

test("Killing a patroller stops it blocking attacks", () => {
  const s0 = getGameWithUnits(["older_brother"], ["iron_man", "iron_man"]);
  const ob = findEntityIds(s0, e => e.card == "older_brother")[0];
  const [im1, im2] = findEntityIds(s0, e => e.card == "iron_man");
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const s1 = playActions(s0, [
    { type: "endTurn", patrollers: [null, null, null, null, ob] }
  ]);
  const atk = { type: "attack", attacker: im2, target: p1base };
  expect(() => CodexGame.checkAction(s1, atk)).toThrow();
  const s2 = playActions(s1, [{ type: "attack", attacker: im1, target: ob }]);
  expect(() => CodexGame.checkAction(s2, atk)).not.toThrow();
});

test("Lookout gets +1 resist (but only as long as patrolling)", () => {
  const [s0, troq] = withInsertedEntity(
    withCardsInHand(getTestGame(), [], ["wither"]),
    testp2Id,
    "troq_bashar"
  );
  const [s1, ob] = withInsertedEntity(s0, testp1Id, "older_brother");
  const s2 = playActions(s1, [
    { type: "endTurn", patrollers: [null, null, null, null, ob] },
    { type: "play", card: "wither" }
  ]);
  const g = s2.players[testp2Id].gold;
  const s3 = playActions(s2, [{ type: "choice", target: ob }]);
  expect(s3.players[testp2Id].gold).toEqual(g - 1);
  const s2a = withGoldSetTo(s2, testp2Id, 0);
  expect(() =>
    CodexGame.checkAction(s2a, { type: "choice", target: ob })
  ).toThrow();
  const s2b = playActions(
    withCardsInHand(
      playActions(s1, [
        { type: "endTurn", patrollers: [null, null, null, null, ob] },
        { type: "endTurn" },
        { type: "endTurn" }
      ]),
      [],
      ["wither"]
    ),
    [{ type: "play", card: "wither" }]
  );
  const gb = s2b.players[testp2Id].gold;
  const s3b = playActions(s2b, [{ type: "choice", target: ob }]);
  expect(s3b.players[testp2Id].gold).toEqual(gb);
  const s2c = withGoldSetTo(s2b, testp2Id, 0);
  expect(() =>
    CodexGame.checkAction(s2c, { type: "choice", target: ob })
  ).not.toThrow();
});

test("Patrolling doesn't grant any abilities", () => {
  const [s0, bros] = withInsertedEntities(
    getTestGame(),
    testp1Id,
    [1, 2, 3, 4, 5].map(_ => "older_brother")
  );
  const s1 = playActions(s0, [{ type: "endTurn", patrollers: bros }]);
  const broVals = getCurrentValues(s1, bros);
  forEach(broVals, v => {
    expect(v.abilities.length).toEqual(0);
  });
});

test("Heroes and units can both patrol", () => {
  const tg = new TestGame().insertEntities(testp1Id, [
    "troq_bashar",
    "helpful_turtle"
  ]);
  const [troq, ht] = tg.insertedEntityIds;
  const mixedPz = [troq, ht, null, null, null];
  tg.playAction({ type: "endTurn", patrollers: mixedPz });
  expect(tg.state.players[testp1Id].patrollerIds).toEqual(mixedPz);
});

test("Gain a gold from death of scavenger", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "older_brother")
    .insertEntity(testp2Id, "eggship");
  const [ob, es] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, null, ob, null, null] },
    { type: "attack", attacker: es, target: ob }
  ]);
  expect(tg.state.players[testp1Id].gold).toEqual(5);
  expect(tg.state.log).toContain(
    `\${${testp1Id}} gains 1 gold from death of scavenger.`
  );
});
