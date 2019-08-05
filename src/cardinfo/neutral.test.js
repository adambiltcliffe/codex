import { fixtureNames } from "../fixtures";
import {
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  testp2Id,
  findEntityIds,
  getGameWithUnits,
  withCardsInHand,
  withInsertedEntity,
  withInsertedEntities,
  getTestGame,
  TestGame
} from "../testutil";
import { getCurrentValues } from "../entities";
import CodexGame from "../codex";
import produce from "immer";

test("Timely Messenger can attack with haste", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["timely_messenger"])
    .playAction({ type: "play", card: "timely_messenger" });
  const tm = findEntityIds(tg.state, e => e.card == "timely_messenger")[0];
  const p2base = tg.findBaseId(testp2Id);
  expect(() =>
    tg.checkAction({
      type: "attack",
      attacker: tm,
      target: p2base
    })
  ).not.toThrow();
  tg.playAction({ type: "attack", attacker: tm, target: p2base });
  expect(tg.state.entities[p2base].damage).toEqual(1);
});

test("Helpful Turtle heals your units but not the enemy's", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["helpful_turtle", "tenderfoot"])
    .putCardsInHand(testp2Id, ["tenderfoot"])
    .playActions([
      { type: "play", card: "tenderfoot" },
      { type: "play", card: "helpful_turtle" },
      { type: "endTurn" },
      { type: "play", card: "tenderfoot" },
      { type: "endTurn" }
    ]);
  const attacker = findEntityIds(
    tg.state,
    u => u.owner == testp1Id && u.card == "tenderfoot"
  )[0];
  const target = findEntityIds(
    tg.state,
    u => u.owner == testp2Id && u.card == "tenderfoot"
  )[0];
  tg.playAction({ type: "attack", attacker, target });
  expect(tg.state.entities[attacker].damage).toEqual(1);
  expect(tg.state.entities[target].damage).toEqual(1);
  tg.playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  expect(tg.state.entities[attacker].damage).toEqual(0);
  expect(tg.state.entities[target].damage).toEqual(1);
  expect(tg.state.log).toContain(
    "Helpful Turtle heals 1 damage from Tenderfoot."
  );
});

test("Fruit Ninja's frenzy functions correctly", () => {
  const s0 = getNewGame();
  s0.players[testp1Id].gold = 20;
  s0.players[testp2Id].gold = 20;
  putCardInHand(s0, testp2Id, "iron_man");
  putCardInHand(s0, testp2Id, "iron_man");
  const [s1, [fn1, fn2]] = withInsertedEntities(s0, testp1Id, [
    "fruit_ninja",
    "fruit_ninja"
  ]);
  expect(getCurrentValues(s1, fn1).attack).toEqual(3);
  const s2 = playActions(s1, [
    { type: "endTurn" },
    { type: "play", card: "iron_man" },
    { type: "play", card: "iron_man" }
  ]);
  const ims = findEntityIds(s2, u => u.card == "iron_man");
  expect(getCurrentValues(s2, fn1).attack).toEqual(2);
  const s3 = playActions(s2, [
    { type: "endTurn" },
    { type: "attack", attacker: fn1, target: ims[0] }
  ]);
  expect(s3.entities[ims[0]].damage).toEqual(3);
  const s4 = playActions(s3, [
    { type: "endTurn" },
    { type: "attack", attacker: ims[1], target: fn2 }
  ]);
  expect(s4.entities[ims[1]].damage).toEqual(2);
});

test("Brick Thief can steal a brick from enemy base at start of game", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "brick_thief");
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const p2base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  s0.entities[p1base].damage = 2;
  const s1 = playActions(s0, [
    {
      type: "play",
      card: "brick_thief"
    },
    { type: "choice", target: p2base }
  ]);
  expect(s1.log).toContain("Brick Thief deals 1 damage to base.");
  expect(s1.log).toContain("Brick Thief repairs 1 damage from base.");
  const bt = findEntityIds(s1, e => e.card == "brick_thief")[0];
  const s2 = playActions(s1, [{ type: "endTurn" }, { type: "endTurn" }]);
  const s2b = playActions(s2, [
    { type: "attack", attacker: bt, target: p2base }
  ]);
  const s3 = playActions(s2b, [{ type: "choice", target: p2base }]);
  expect(s3.log).toContain("Brick Thief deals 1 damage to base.");
  expect(s3.log).toContain("Brick Thief repairs 1 damage from base.");
});

//Reinstate this test when more than 2 buildings can be in play
/*test("Brick Thief can steal a brick from an opposing building", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "brick_thief");
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const p2base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  s0.entities[p1base].damage = 2;
  const s1 = playActions(s0, [
    {
      type: "play",
      card: "brick_thief"
    },
    { type: "choice", target: p2base }
  ]);
  expect(s1.log).toContain("Brick Thief deals 1 damage to base.");
  const s2 = playActions(s1, [{ type: "choice", target: p1base }]);
  expect(s2.log).toContain("Brick Thief repairs 1 damage from base.");
  const bt = findEntityIds(s2, e => e.card == "brick_thief")[0];
  const s2a = playActions(s2, [{ type: "endTurn" }, { type: "endTurn" }]);
  const s2b = playActions(s2a, [
    { type: "attack", attacker: bt, target: p2base }
  ]);
  const s3 = playActions(s2b, [{ type: "choice", target: p2base }]);
  expect(s3.log).toContain("Brick Thief deals 1 damage to base.");
  const s4 = playActions(s3, [{ type: "choice", target: p1base }]);
  expect(s4.log).toContain("Brick Thief repairs 1 damage from base.");
});*/

test("Brick Thief doesn't report repairing damage if it didn't", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "brick_thief");
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const p2base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  const s1 = playActions(s0, [
    {
      type: "play",
      card: "brick_thief"
    },
    { type: "choice", target: p2base }
  ]);
  expect(s1.log).toContain("Brick Thief deals 1 damage to base.");
  expect(s1.log).not.toContain("Brick Thief repairs 1 damage from base.");
});

test("Brick Thief can't damage and then repair the same building", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "brick_thief");
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const s1 = playActions(s0, [
    {
      type: "play",
      card: "brick_thief"
    },
    { type: "choice", target: p1base }
  ]);
  expect(() => {
    CodexGame.checkAction(s1, { type: "choice", target: p1base });
  }).toThrow();
});

test("Spark can deal damage to patroller", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "older_brother"])
    .insertEntity(testp2Id, "troq_bashar")
    .putCardsInHand(testp2Id, ["spark"]);
  const [ob1, ob2] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, ob1, ob2, null, null] },
    { type: "play", card: "spark" },
    { type: "choice", target: ob1 }
  ]);
  expect(tg.state.entities[ob1].damage).toEqual(1);
});

test("Spark can't target non-patroller", () => {
  const tg = new TestGame().insertEntities(testp1Id, [
    "older_brother",
    "older_brother",
    "older_brother"
  ]);
  const [ob1, ob2, ob3] = tg.insertedEntityIds;
  tg.playAction({ type: "endTurn", patrollers: [ob2, ob3, null, null, null] });
  tg.insertEntity(testp2Id, "troq_bashar")
    .putCardsInHand(testp2Id, ["spark"])
    .playAction({ type: "play", card: "spark" });
  expect(() => {
    tg.checkAction({ type: "choice", target: ob1 });
  }).toThrow();
  expect(tg.getLegalChoices().sort()).toEqual([ob2, ob3].sort());
});

test("Wither puts -1/-1 rune on a unit", () => {
  const [s0, troq] = withInsertedEntity(
    withCardsInHand(getGameWithUnits([], ["older_brother"]), ["wither"], []),
    testp1Id,
    "troq_bashar"
  );
  const ob = findEntityIds(s0, e => e.card == "older_brother")[0];
  const s1 = playActions(s0, [
    { type: "play", card: "wither" },
    { type: "choice", target: ob }
  ]);
  expect(s1.entities[ob].runes).toEqual(-1);
  expect(getCurrentValues(s1, ob).attack).toEqual(1);
  expect(getCurrentValues(s1, ob).hp).toEqual(1);
});

test("Wither kills units with 1hp", () => {
  const [s0, troq] = withInsertedEntity(
    withCardsInHand(getTestGame(), ["wither"], []),
    testp1Id,
    "troq_bashar"
  );
  const [s0a, tm] = withInsertedEntity(s0, testp2Id, "timely_messenger");
  const s1 = playActions(s0a, [
    { type: "play", card: "wither" },
    { type: "choice", target: tm }
  ]);
  expect(s1.entities[tm]).toBeUndefined();
  expect(s1.log).toContain("Timely Messenger dies.");
});

test("Bloom puts a +1/+1 rune on a unit, but only if it doesn't have one", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntity(testp2Id, "older_brother")
    .putCardsInHand(testp1Id, ["bloom", "bloom"]);
  const [troq, ob] = tg.insertedEntityIds;
  const acts = [
    { type: "play", card: "bloom" },
    { type: "choice", target: ob }
  ];
  tg.playActions(acts);
  expect(tg.state.entities[ob].runes).toEqual(1);
  expect(getCurrentValues(tg.state, ob).attack).toEqual(3);
  expect(getCurrentValues(tg.state, ob).hp).toEqual(3);
  expect(() => {
    tg.playActions(acts);
  }).toThrow();
});
