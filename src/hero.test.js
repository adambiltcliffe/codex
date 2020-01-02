import {
  playActions,
  findEntityIds,
  testp1Id,
  withInsertedEntity,
  getTestGame,
  testp2Id,
  TestGame
} from "./testutil";
import CodexGame from "./game";

test("Summoning hero and levelling up", () => {
  const s0 = new TestGame()
    .setGold(testp1Id, 9)
    .putHeroInCommandZone(testp1Id, "troq_bashar").state;
  const s1 = playActions(s0, [{ type: "summon", hero: "troq_bashar" }]);
  const troq = findEntityIds(s1, e => e.card == "troq_bashar")[0];
  expect(s1.players[testp1Id].gold).toEqual(7);
  expect(s1.entities[troq].current.attack).toEqual(2);
  expect(s1.entities[troq].current.hp).toEqual(3);
  expect(s1.entities[troq].current.abilities.length).toEqual(0);
  const s2 = playActions(s1, [{ type: "level", hero: troq, amount: 4 }]);
  expect(s2.players[testp1Id].gold).toEqual(3);
  expect(s2.entities[troq].current.attack).toEqual(3);
  expect(s2.entities[troq].current.hp).toEqual(4);
  expect(s2.entities[troq].current.abilities.length).toEqual(1);
  expect(s2.log).not.toContain("Troq Bashar is fully healed.");
  const s3 = playActions(s2, [{ type: "level", hero: troq, amount: 3 }]);
  expect(s3.players[testp1Id].gold).toEqual(0);
  expect(s3.entities[troq].current.attack).toEqual(4);
  expect(s3.entities[troq].current.hp).toEqual(5);
  expect(s3.entities[troq].current.abilities.length).toEqual(2);
  expect(s3.log).not.toContain("Troq Bashar is fully healed.");
});

test("Can't level hero past max", () => {
  const s0 = new TestGame()
    .setGold(testp1Id, 20)
    .putHeroInCommandZone(testp1Id, "troq_bashar").state;
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
  const s0 = new TestGame().putHeroInCommandZone(testp1Id, "troq_bashar").state;
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
  const s0 = new TestGame()
    .insertEntities(testp2Id, ["older_brother", "iron_man"])
    .putHeroInCommandZone(testp1Id, "troq_bashar").state;
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

test("Own hero dies on your turn with two opposing heroes", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["iron_man", "river_montoya", "jaina_stormborne"])
    .insertEntity(testp2Id, "troq_bashar");
  const [im, river, jaina, troq] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im }
  ]);
  expect(tg.state.currentTrigger).not.toBeNull();
  expect(tg.state.entities[river].level).toEqual(1);
  expect(tg.getLegalChoices().sort()).toEqual([river, jaina].sort());
  tg.playAction({ type: "choice", target: river });
  expect(tg.state.log).toContain("River Montoya gains 2 levels.");
  expect(tg.state.entities[river].level).toEqual(3);
});

test("Own hero dies on your turn with maxed and unmaxed opposing heroes", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["iron_man", "river_montoya", "jaina_stormborne"])
    .insertEntity(testp2Id, "troq_bashar");
  const [im, river, jaina, troq] = tg.insertedEntityIds;
  tg.modifyEntity(jaina, { level: 7 });
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

test("Kill opponent's hero when you don't have your own", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntity(testp2Id, "iron_man");
  const [troq, im] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: im, target: troq }
  ]);
  expect(tg.state.currentTrigger).toBeNull();
  expect(tg.state.log).toContain(
    "Choose a hero to gain 2 levels: No legal choices."
  );
});

test("Kill opponent's hero when you have one of your own", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, ["iron_man", "river_montoya"]);
  const [troq, im, river] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: im, target: troq }
  ]);
  expect(tg.state.currentTrigger).toBeNull();
  expect(tg.state.log).toContain(
    "Choose a hero to gain 2 levels: Only one legal choice."
  );
  expect(tg.state.log).toContain("River Montoya gains 2 levels.");
  expect(tg.state.entities[river].level).toEqual(3);
});

test("Kill opponent's hero when you have two of your own", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, [
      "iron_man",
      "river_montoya",
      "jaina_stormborne"
    ]);
  const [troq, im, river, jaina] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: im, target: troq }
  ]);
  expect(tg.state.currentTrigger).not.toBeNull();
  expect(tg.state.entities[river].level).toEqual(1);
  expect(tg.getLegalChoices().sort()).toEqual([river, jaina].sort());
  tg.playAction({ type: "choice", target: river });
  expect(tg.state.log).toContain("River Montoya gains 2 levels.");
  expect(tg.state.entities[river].level).toEqual(3);
});

test("Kill opponent's hero when yours is 1 level off max", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, ["iron_man", "river_montoya"]);
  const [troq, im, river] = tg.insertedEntityIds;
  tg.modifyEntity(river, { level: 4 });
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: im, target: troq }
  ]);
  expect(tg.state.currentTrigger).toBeNull();
  expect(tg.state.log).toContain(
    "Choose a hero to gain 2 levels: Only one legal choice."
  );
  expect(tg.state.log).toContain("River Montoya gains 1 level.");
  expect(tg.state.entities[river].level).toEqual(5);
});

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
    .insertEntity(testp2Id, "eggship")
    .putHeroInCommandZone(testp1Id, "troq_bashar");
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

test("Hero is fully healed when gaining levels due to trigger", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "captain_zane")
    .insertEntity(testp2Id, "jaina_stormborne");
  const [zane, jaina] = tg.insertedEntityIds;
  tg.modifyEntity(jaina, { level: 2 }).playAction({
    type: "attack",
    attacker: zane,
    target: jaina
  });
  expect(tg.state.log).toContain("Captain Zane dies.");
  expect(tg.state.entities[zane]).toBeUndefined();
  expect(tg.state.log).toContain("Jaina Stormborne gains 2 levels.");
  expect(tg.state.log).toContain("Jaina Stormborne is fully healed.");
  expect(tg.state.entities[jaina].damage).toEqual(0);
});
