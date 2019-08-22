import {
  getNewGame,
  playActions,
  findEntityIds,
  testp1Id,
  getGameWithUnits,
  withInsertedEntity,
  getTestGame,
  testp2Id,
  TestGame
} from "./testutil";
import { getCurrentValues } from "./entities";
import CodexGame from "./codex";

test("Summoning hero and levelling up", () => {
  const s0 = getNewGame();
  s0.players[testp1Id].gold = 9;
  const s1 = playActions(s0, [{ type: "summon", hero: "troq_bashar" }]);
  const troq = findEntityIds(s1, e => e.card == "troq_bashar")[0];
  expect(s1.players[testp1Id].gold).toEqual(7);
  expect(getCurrentValues(s1, troq).attack).toEqual(2);
  expect(getCurrentValues(s1, troq).hp).toEqual(3);
  expect(getCurrentValues(s1, troq).abilities.length).toEqual(0);
  const s2 = playActions(s1, [{ type: "level", hero: troq, amount: 4 }]);
  expect(s2.players[testp1Id].gold).toEqual(3);
  expect(getCurrentValues(s2, troq).attack).toEqual(3);
  expect(getCurrentValues(s2, troq).hp).toEqual(4);
  expect(getCurrentValues(s2, troq).abilities.length).toEqual(1);
  expect(s2.log).not.toContain("Troq Bashar is fully healed.");
  const s3 = playActions(s2, [{ type: "level", hero: troq, amount: 3 }]);
  expect(s3.players[testp1Id].gold).toEqual(0);
  expect(getCurrentValues(s3, troq).attack).toEqual(4);
  expect(getCurrentValues(s3, troq).hp).toEqual(5);
  expect(getCurrentValues(s3, troq).abilities.length).toEqual(2);
  expect(s3.log).not.toContain("Troq Bashar is fully healed.");
});

test("Can't level hero past max", () => {
  const s0 = getNewGame();
  s0.players[testp1Id].gold = 20;
  const s1 = playActions(s0, [{ type: "summon", hero: "troq_bashar" }]);
  const troq = findEntityIds(s1, e => e.card == "troq_bashar")[0];
  expect(() =>
    CodexGame.checkAction(s1, { type: "level", hero: troq, amount: 7 })
  ).not.toThrow();
  expect(() =>
    CodexGame.checkAction(s1, { type: "level", hero: troq, amount: 8 })
  ).toThrow();
});

test("Can't level hero without paying for it", () => {
  const s0 = getNewGame();
  const s1 = playActions(s0, [{ type: "summon", hero: "troq_bashar" }]);
  const troq = findEntityIds(s1, e => e.card == "troq_bashar")[0];
  expect(() =>
    CodexGame.checkAction(s1, { type: "level", hero: troq, amount: 2 })
  ).not.toThrow();
  expect(() =>
    CodexGame.checkAction(s1, { type: "level", hero: troq, amount: 3 })
  ).toThrow();
});

test("Levelling up a hero to mid/maxband heals all damage", () => {
  const s0 = getGameWithUnits([], ["older_brother", "iron_man"]);
  const s1 = playActions(s0, [{ type: "summon", hero: "troq_bashar" }]);
  const troq = findEntityIds(s1, e => e.card == "troq_bashar")[0];
  const ob = findEntityIds(s1, e => e.card == "older_brother")[0];
  const im = findEntityIds(s1, e => e.card == "iron_man")[0];
  const s1a = playActions(s1, [
    { type: "endTurn" },
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: ob }
  ]);
  const s2 = playActions(s1a, [{ type: "level", hero: troq, amount: 4 }]);
  expect(s2.entities[troq].damage).toEqual(0);
  expect(s2.log).toContain("Troq Bashar is fully healed.");
  const s3 = playActions(s2, [
    { type: "endTurn" },
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im },
    { type: "level", hero: troq, amount: 3 }
  ]);
  expect(s3.entities[troq].damage).toEqual(0);
  expect(s3.entities[im].damage).toEqual(3);
  expect(s3.log).toContain("Troq Bashar is fully healed.");
});

test("Heroes go to command zone after dying", () => {
  const [s0, troq] = withInsertedEntity(getTestGame(), testp1Id, "troq_bashar");
  const [s1, im] = withInsertedEntity(s0, testp2Id, "iron_man");
  const s2 = playActions(s1, [
    { type: "endTurn" },
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im }
  ]);
  expect(s2.log).toContain("Troq Bashar dies.");
  expect(s2.players[testp1Id].discard).not.toContain("troq_bashar");
  expect(s2.players[testp1Id].commandZone).toContain("troq_bashar");
});

test("Own hero dies on your turn with no opposing hero, no levels gained", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "troq_bashar");
  const [im, troq] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im }
  ]);
  expect(tg.state.currentTrigger).toBeNull();
  expect(tg.state.log).toContain(
    "Choose a hero to gain 2 levels: No legal choices."
  );
});

test("Own hero dies on your turn with one opposing hero", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["iron_man", "river_montoya"])
    .insertEntity(testp2Id, "troq_bashar");
  const [im, river, troq] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im }
  ]);
  expect(tg.state.currentTrigger).toBeNull();
  expect(tg.state.log).toContain(
    "Choose a hero to gain 2 levels: Only one legal choice."
  );
  expect(tg.state.log).toContain("River Montoya gains 2 levels.");
  expect(tg.state.entities[river].level).toEqual(3);
});

/*
Hero death on own turn: choice of two opposing heroes to gain levels
Hero death on own turn: have to give levels to non-maxed opposing hero
Opponent's hero death: no own hero, trigger skipped
Opponent's hero death: own single hero automatically gains 2 levels
Opponent's hero death: own single hero gains 1 level if that reaches max
Opponent's hero death: choice of own heroes to gain level
*/

test("Hero dies on your turn, cooldown this turn and next", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "troq_bashar");
  const [im, troq] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im }
  ]);
  expect(tg.state.entities[troq]).toBeUndefined();
  expect(tg.state.players[testp2Id].commandZone).toContain("troq_bashar");
  expect(tg.state.players[testp2Id].heroCooldowns["troq_bashar"]).toEqual(2);
  expect(() => tg.checkAction({ type: "summon", hero: "troq_bashar" })).toThrow(
    "cooldown"
  );
  tg.playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  expect(tg.state.players[testp2Id].heroCooldowns["troq_bashar"]).toEqual(1);
  expect(() => tg.checkAction({ type: "summon", hero: "troq_bashar" })).toThrow(
    "cooldown"
  );
  tg.playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  expect(tg.state.players[testp2Id].heroCooldowns["troq_bashar"]).toEqual(0);
  expect(() =>
    tg.checkAction({ type: "summon", hero: "troq_bashar" })
  ).not.toThrow();
});

test("Hero dies on opponent's turn, cooldown on your next turn", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "troq_bashar");
  const [im, troq] = tg.insertedEntityIds;
  tg.playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  tg.playActions([
    { type: "attack", attacker: im, target: troq },
    { type: "endTurn" }
  ]);
  expect(tg.state.entities[troq]).toBeUndefined();
  expect(tg.state.players[testp2Id].commandZone).toContain("troq_bashar");
  expect(tg.state.players[testp2Id].heroCooldowns["troq_bashar"]).toEqual(1);
  expect(() => tg.checkAction({ type: "summon", hero: "troq_bashar" })).toThrow(
    "cooldown"
  );
  tg.playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  expect(tg.state.players[testp2Id].heroCooldowns["troq_bashar"]).toEqual(0);
  expect(() =>
    tg.checkAction({ type: "summon", hero: "troq_bashar" })
  ).not.toThrow();
});

test("Can play a different hero when one is on cooldown", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "river_montoya")
    .insertEntity(testp2Id, "eggship");
  const [river, es] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: es, target: river },
    { type: "endTurn" }
  ]);
  expect(() =>
    tg.checkAction({ type: "summon", hero: "river_montoya" })
  ).toThrow("cooldown");
  expect(() =>
    tg.checkAction({ type: "summon", hero: "troq_bashar" })
  ).not.toThrow();
});
