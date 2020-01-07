import { testp2Id, testp1Id, TestGame } from "../testutil";
import { getLegalChoicesForCurrentTrigger } from "../triggers";

test("Zane at level 1 has haste", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "captain_zane")
    .insertEntity(testp2Id, "tenderfoot");
  const [zane, tf] = tg.insertedEntityIds;
  const act = { type: "attack", attacker: zane, target: tf };
  expect(() => tg.checkAction(act)).not.toThrow();
  tg.playAction(act);
  expect(tg.state.log).toContain("Captain Zane deals 2 damage to Tenderfoot.");
});

test("Zane gains gold (but doesn't draw cards) when killing a scavenger", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, ["older_brother"])
    .insertEntity(testp2Id, "captain_zane");
  const [ob, zane] = tg.insertedEntityIds;
  tg.modifyEntity(zane, { level: 4 }).playActions([
    { type: "endTurn", patrollers: [null, null, ob, null, null] },
    { type: "attack", attacker: zane, target: ob }
  ]);
  expect(tg.state.newTriggers).toHaveLength(2);
  tg.playAction({ type: "queue", index: 0 });
  expect(tg.state.log).toContain(
    `\${${testp2Id}} gains 1 gold from killing a scavenger.`
  );
  expect(tg.state.players[testp2Id].gold).toEqual(6);
  expect(tg.state.players[testp2Id].hand).toHaveLength(5);
});

test("Zane draws a card (but doesn't gain gold) when killing a technician", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, ["older_brother"])
    .insertEntity(testp2Id, "captain_zane");
  const [ob, zane] = tg.insertedEntityIds;
  tg.modifyEntity(zane, { level: 4 }).playActions([
    { type: "endTurn", patrollers: [null, null, null, ob, null] },
    { type: "attack", attacker: zane, target: ob }
  ]);
  expect(tg.state.newTriggers).toHaveLength(2);
  tg.playAction({ type: "queue", index: 0 });
  expect(tg.state.log).toContain(
    `\${${testp2Id}} draws 1 card from killing a technician.`
  );
  expect(tg.state.players[testp2Id].gold).toEqual(5);
  expect(tg.state.players[testp2Id].hand).toHaveLength(6);
});

test("Zane doesn't gain gold from hurting a scavenger", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "captain_zane");
  const [im, zane] = tg.insertedEntityIds;
  tg.modifyEntity(zane, { level: 4 }).playActions([
    { type: "endTurn", patrollers: [null, null, im, null, null] },
    { type: "attack", attacker: zane, target: im }
  ]);
  expect(tg.state.newTriggers).toHaveLength(0);
  expect(tg.state.queue).toHaveLength(0);
  expect(tg.state.players[testp2Id].gold).toEqual(5);
});

test("Zane doesn't draw from hurting a technician", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "captain_zane");
  const [im, zane] = tg.insertedEntityIds;
  tg.modifyEntity(zane, { level: 4 }).playActions([
    { type: "endTurn", patrollers: [null, null, null, im, null] },
    { type: "attack", attacker: zane, target: im }
  ]);
  expect(tg.state.newTriggers).toHaveLength(0);
  expect(tg.state.queue).toHaveLength(0);
  expect(tg.state.players[testp2Id].hand).toHaveLength(5);
});

test("Zane's midband doesn't trigger unless he kills the patroller himself", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "older_brother"])
    .insertEntities(testp2Id, ["captain_zane", "iron_man", "iron_man"]);
  const [ob1, ob2, zane, im1, im2] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, null, ob1, ob2, null] },
    { type: "attack", attacker: im1, target: ob1 },
    { type: "attack", attacker: im2, target: ob2 }
  ]);
  expect(tg.state.newTriggers).toHaveLength(0);
  expect(tg.state.queue).toHaveLength(0);
  expect(tg.state.players[testp2Id].gold).toEqual(5);
  expect(tg.state.players[testp2Id].hand).toHaveLength(5);
});

test("Zane can use his maxband trigger to shove and damage a patroller", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "tenderfoot"])
    .insertEntity(testp2Id, "captain_zane");
  const [ob, tf, zane] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, ob, tf, null, null] },
    { type: "level", hero: zane, amount: 5 }
  ]);
  expect(tg.state.currentTrigger.path).toEqual(
    "cardInfo.captain_zane.bands[2].abilities[0]"
  );
  expect(getLegalChoicesForCurrentTrigger(tg.state)).toEqual([ob, tf]);
  tg.playAction({ type: "choice", target: ob });
  expect(getLegalChoicesForCurrentTrigger(tg.state)).toEqual([0, 3, 4]);
  tg.playAction({ type: "choice", index: 3 });
  expect(tg.state.entities[ob].current.patrolSlot).toEqual(3);
  expect(tg.state.players[testp1Id].patrollerIds[1]).toBeNull();
  expect(tg.state.players[testp1Id].patrollerIds[3]).toEqual(ob);
  expect(tg.state.log).toContain(
    "Captain Zane deals 1 damage to Older Brother."
  );
  expect(tg.state.entities[ob].damage).toEqual(1);
});

// Zane max level trigger can push patroller somewhere else and damage it
// Zane max level trigger has to push patroller if possible rather than leave it
// Zane max level trigger still does damage if nowhere to push to
// Zane max level trigger gets the new scavenger/technician bonus but not old
// Zane max level trigger removes armor if pushing out of squad leader
// Zane max level trigger grants armor if pushing into squad leader

test("Jaina at level 1 has sparkshot", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "timely_messenger"])
    .insertEntity(testp2Id, "jaina_stormborne");
  const [ob, tm, jaina] = tg.insertedEntityIds;
  expect(tg.state.entities[jaina].current.abilities.length).toEqual(1);
  tg.playActions([
    { type: "endTurn", patrollers: [null, tm, ob, null, null] },
    { type: "attack", attacker: jaina, target: ob }
  ]);
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).toContain("Timely Messenger dies.");
});

test("Jaina's level 4 ability can deal 1 to patrolling unit or building", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "older_brother",
      "timely_messenger",
      "troq_bashar"
    ])
    .insertEntity(testp2Id, "jaina_stormborne");
  const [ob, tm, troq, jaina] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  const p2base = tg.findBaseId(testp2Id);
  tg.modifyEntity(jaina, { level: 4 });
  expect(tg.state.entities[jaina].current.abilities.length).toEqual(2);
  tg.playActions([
    { type: "endTurn", patrollers: [null, ob, troq, null, null] },
    { type: "activate", source: jaina, index: 1 }
  ]);
  expect(tg.getLegalChoices().sort()).toEqual([ob, p1base, p2base].sort());
  const tg1 = new TestGame(tg.state);
  tg1.playAction({ type: "choice", target: ob });
  expect(tg1.state.log).toContain(
    "Jaina Stormborne deals 1 damage to Older Brother."
  );
  expect(tg1.state.entities[ob].damage).toEqual(1);
  const tg2 = new TestGame(tg.state);
  tg2.playAction({ type: "choice", target: p1base });
  expect(tg2.state.log).toContain("Jaina Stormborne deals 1 damage to base.");
  expect(tg2.state.entities[p1base].damage).toEqual(1);
});

test("Jaina's level 7 ability can deal 3 to unit or building", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["iron_man", "timely_messenger", "troq_bashar"])
    .insertEntity(testp2Id, "jaina_stormborne");
  const [im, tm, troq, jaina] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  const p2base = tg.findBaseId(testp2Id);
  tg.modifyEntity(jaina, { level: 7 });
  expect(tg.state.entities[jaina].current.abilities.length).toEqual(3);
  tg.playActions([
    { type: "endTurn", patrollers: [null, im, troq, null, null] },
    { type: "activate", source: jaina, index: 2 }
  ]);
  expect(tg.getLegalChoices().sort()).toEqual([im, tm, p1base, p2base].sort());
  const tg1 = new TestGame(tg.state);
  tg1.playAction({ type: "choice", target: im });
  expect(tg1.state.log).toContain(
    "Jaina Stormborne deals 3 damage to Iron Man."
  );
  expect(tg1.state.entities[im].damage).toEqual(3);
  const tg2 = new TestGame(tg.state);
  tg2.playAction({ type: "choice", target: p1base });
  expect(tg2.state.log).toContain("Jaina Stormborne deals 3 damage to base.");
  expect(tg2.state.entities[p1base].damage).toEqual(3);
});
