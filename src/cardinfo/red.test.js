import { TestGame, testp1Id, testp2Id, findEntityIds } from "../testutil";
import { hasKeyword, haste } from "./abilities/keywords";

test("Careless Musketeer can targets units and buildings and damages the target and your base", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["careless_musketeer", "nautical_dog", "mad_man"])
    .insertEntities(testp2Id, ["iron_man", "troq_bashar"]);
  const [cm, nd, mm, im, troq] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  const p2base = tg.findBaseId(testp2Id);
  const act = { type: "activate", source: cm, index: 0 };
  expect(() => tg.checkAction(act)).toThrow("arrival fatigue");
  tg.modifyEntity(cm, { controlledSince: -1 });
  expect(() => tg.checkAction(act)).not.toThrow();
  tg.playAction(act);
  expect(tg.getLegalChoices().sort()).toEqual(
    [p1base, p2base, cm, nd, mm, im].sort()
  );
  tg.playAction({ type: "choice", target: im });
  expect(tg.state.entities[im].damage).toEqual(1);
  expect(tg.state.entities[p1base].damage).toEqual(1);
  expect(tg.state.entities[p2base].damage).toEqual(0);
  expect(tg.state.log).toContain(
    "Careless Musketeer deals 1 damage to Iron Man and 1 damage to base."
  );
});

test("Careless Musketeer can hurt your own units but still damages your own base", () => {
  const tg = new TestGame().insertEntity(testp1Id, "careless_musketeer");
  const [cm] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.modifyEntity(cm, { controlledSince: -1 })
    .modifyEntity(p1base, { damage: 19 })
    .playActions([
      { type: "activate", source: cm, index: 0 },
      { type: "choice", target: cm }
    ]);
  expect(tg.state.log).toContain(
    "Careless Musketeer deals 1 damage to itself and 1 damage to base."
  );
  expect(tg.state.log).toContain("Careless Musketeer dies.");
  expect(tg.state.log).toContain(`\${${testp2Id}} wins the game.`);
  expect(tg.state.result).toEqual({ winner: testp2Id });
});

test("Bombaster can sacrifice to damage a patroller", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["iron_man", "iron_man", "iron_man"])
    .insertEntity(testp2Id, "bombaster");
  const [im1, im2, im3, bb] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, im1, im2, null, null] },
    { type: "activate", source: bb, index: 0 }
  ]);
  expect(tg.state.log).toContain("Bombaster is sacrificed.");
  expect(tg.getLegalChoices().sort()).toEqual([im1, im2].sort());
  tg.playAction({ type: "choice", target: im1 });
  expect(tg.state.entities[bb]).toBeUndefined();
  expect(tg.state.entities[im1].damage).toEqual(2);
  expect(tg.state.log).toContain("Bombaster deals 2 damage to Iron Man.");
});

test("Bloodrage Ogre returns to hand at the end of your turn if he doesn't attack", () => {
  const tg = new TestGame().putCardsInHand(testp1Id, ["bloodrage_ogre"]);
  tg.playAction({ type: "play", card: "bloodrage_ogre" });
  const ids = findEntityIds(tg.state, e => e.card == "bloodrage_ogre");
  expect(ids).toHaveLength(1);
  const bo = ids[0];
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[bo]).not.toBeUndefined();
  expect(tg.state.log).not.toContain(
    `Bloodrage Ogre is returned to \${${testp1Id}}'s hand.`
  );
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[bo]).not.toBeUndefined();
  expect(tg.state.log).not.toContain(
    `Bloodrage Ogre is returned to \${${testp1Id}}'s hand.`
  );
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[bo]).toBeUndefined();
  expect(tg.state.log).toContain(
    `Bloodrage Ogre is returned to \${${testp1Id}}'s hand.`
  );
  expect(tg.state.players[testp1Id].hand).toContain("bloodrage_ogre");
});

test("Bloodrage Ogre stays in play if he attacks, but only if he keeps attacking", () => {
  const tg = new TestGame().putCardsInHand(testp1Id, ["bloodrage_ogre"]);
  const p2base = tg.findBaseId(testp2Id);
  tg.playAction({ type: "play", card: "bloodrage_ogre" });
  const ids = findEntityIds(tg.state, e => e.card == "bloodrage_ogre");
  expect(ids).toHaveLength(1);
  const bo = ids[0];
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[bo]).not.toBeUndefined();
  expect(tg.state.log).not.toContain(
    `Bloodrage Ogre is returned to \${${testp1Id}}'s hand.`
  );
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[bo]).not.toBeUndefined();
  expect(tg.state.log).not.toContain(
    `Bloodrage Ogre is returned to \${${testp1Id}}'s hand.`
  );
  tg.playActions([
    { type: "attack", attacker: bo, target: p2base },
    { type: "endTurn" }
  ]);
  expect(tg.state.entities[bo]).not.toBeUndefined();
  expect(tg.state.log).not.toContain(
    `Bloodrage Ogre is returned to \${${testp1Id}}'s hand.`
  );
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[bo]).not.toBeUndefined();
  expect(tg.state.log).not.toContain(
    `Bloodrage Ogre is returned to \${${testp1Id}}'s hand.`
  );
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[bo]).toBeUndefined();
  expect(tg.state.log).toContain(
    `Bloodrage Ogre is returned to \${${testp1Id}}'s hand.`
  );
  expect(tg.state.players[testp1Id].hand).toContain("bloodrage_ogre");
});

test("Patrolling with Bloodrage Ogre doesn't break anything", () => {
  const tg = new TestGame().insertEntities(testp1Id, [
    "bloodrage_ogre",
    "nautical_dog"
  ]);
  const [bo, nd] = tg.insertedEntityIds;
  tg.playAction({ type: "endTurn", patrollers: [null, null, bo, nd, null] });
  expect(tg.state.log).toContain(
    `Bloodrage Ogre is returned to \${${testp1Id}}'s hand.`
  );
  expect(tg.state.players[testp1Id].patrollerIds).toEqual([
    null,
    null,
    null,
    nd,
    null
  ]);
});

test("Makeshift Rambaster has 1 ATK vs most things but 3 vs buildings", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, [
    "makeshift_rambaster",
    "makeshift_rambaster"
  ]).insertEntity(testp2Id, "iron_man");
  const [mr1, mr2, im] = tg.insertedEntityIds;
  const p2base = tg.findBaseId(testp2Id);
  tg.playAction({ type: "attack", attacker: mr1, target: im });
  expect(tg.state.log).toContain(
    "Makeshift Rambaster deals 1 damage to Iron Man."
  );
  expect(tg.state.entities[im].damage).toEqual(1);
  tg.playAction({ type: "attack", attacker: mr2, target: p2base });
  expect(tg.state.log).toContain("Makeshift Rambaster deals 3 damage to base.");
  expect(tg.state.entities[p2base].damage).toEqual(3);
});

test("Makeshift Rambaster can't patrol", () => {
  const tg = new TestGame().insertEntity(testp1Id, "makeshift_rambaster");
  const [mr] = tg.insertedEntityIds;
  expect(() =>
    tg.checkAction({
      type: "endTurn",
      patrollers: [mr, null, null, null, null]
    })
  ).toThrow("can't patrol");
});

test("Can put Bloodburn into play", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["bloodburn"])
    .playAction({ type: "play", card: "bloodburn" });
  const bbs = findEntityIds(tg.state, e => e.card == "bloodburn");
  expect(bbs).toHaveLength(1);
  const bb = bbs[0];
  expect(tg.state.entities[bb].current.name).toEqual("Bloodburn");
});

test("Scorch can only target buildings and patrollers and deals 2 damage to them", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["iron_man", "iron_man", "troq_bashar"])
    .insertEntities(testp2Id, ["jaina_stormborne", "nautical_dog"]);
  const [im1, im2, troq, jaina, nd] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  const p2base = tg.findBaseId(testp2Id);
  tg.putCardsInHand(testp2Id, ["scorch"]).playActions([
    { type: "endTurn", patrollers: [null, im1, troq, null, null] },
    { type: "play", card: "scorch" }
  ]);
  expect(tg.getLegalChoices().sort()).toEqual(
    [p1base, p2base, im1, troq].sort()
  );
  tg.playAction({ type: "choice", target: im1 });
  expect(tg.state.entities[im1].damage).toEqual(2);
  expect(tg.state.log).toContain("Scorch deals 2 damage to Iron Man.");
});

test("Charge gives a unit haste and +1 ATK but only for a turn", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "jaina_stormborne",
      "careless_musketeer",
      "nautical_dog"
    ])
    .insertEntity(testp2Id, "tiger_cub")
    .putCardsInHand(testp1Id, ["charge"]);
  const [jaina, cm, nd, tc] = tg.insertedEntityIds;
  const p2base = tg.findBaseId(testp2Id);
  const attackAct = { type: "attack", attacker: cm, target: p2base };
  const activateAct = { type: "activate", source: cm, index: 0 };
  expect(tg.state.entities[cm].current.attack).toEqual(2);
  expect(hasKeyword(tg.state.entities[cm].current, haste)).toBeFalsy();
  expect(() => tg.checkAction(attackAct)).toThrow("arrival fatigue");
  expect(() => tg.checkAction(activateAct)).toThrow("arrival fatigue");
  tg.playAction({ type: "play", card: "charge" });
  expect(tg.getLegalChoices().sort()).toEqual([cm, nd].sort());
  tg.playAction({ type: "choice", target: cm });
  expect(tg.state.entities[cm].current.attack).toEqual(3);
  expect(hasKeyword(tg.state.entities[cm].current, haste)).toBeTruthy();
  expect(() => tg.checkAction(attackAct)).not.toThrow();
  expect(() => tg.checkAction(activateAct)).not.toThrow();
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[cm].current.attack).toEqual(2);
  expect(hasKeyword(tg.state.entities[cm].current, haste)).toBeFalsy();
});

// Pillage deals 2 damage and steals 2 if you have pirate
// Pillage deals 2 damage and steals 1 if that's all opponent has
// Pillaging yourself damages your base but steals nothing

test("Pillage deals 1 damage and steals 1 gold, but only if victim has it", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "jaina_stormborne")
    .insertEntity(testp2Id, "gunpoint_taxman") // opponent's pirate should be ignored
    .setGold(testp2Id, 1)
    .putCardsInHand(testp1Id, ["pillage", "pillage"]);
  const p2base = tg.findBaseId(testp2Id);
  tg.playActions([
    { type: "play", card: "pillage" },
    { type: "choice", target: p2base }
  ]);
  expect(tg.state.log).toContain(
    `\${${testp1Id}} steals 1 gold from \${${testp2Id}}.`
  );
  expect(tg.state.log).toContain("Pillage deals 1 damage to base.");
  expect(tg.state.entities[p2base].damage).toEqual(1);
  expect(tg.state.players[testp1Id].gold).toEqual(4);
  expect(tg.state.players[testp2Id].gold).toEqual(0);
  // Now do it again when opponent has no gold left
  tg.playActions([
    { type: "play", card: "pillage" },
    { type: "choice", target: p2base }
  ]);
  expect(tg.state.log).not.toContain(
    `\${${testp1Id}} steals 1 gold from \${${testp2Id}}.`
  );
  expect(tg.state.log).not.toContain(
    `\${${testp1Id}} steals 0 gold from \${${testp2Id}}.`
  );
  expect(tg.state.log).toContain("Pillage deals 1 damage to base.");
  expect(tg.state.entities[p2base].damage).toEqual(2);
  expect(tg.state.players[testp1Id].gold).toEqual(3);
  expect(tg.state.players[testp2Id].gold).toEqual(0);
});

test("Pillage deals 2 and steals 2 if you have a pirate", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["jaina_stormborne", "gunpoint_taxman"])
    .setGold(testp2Id, 3)
    .putCardsInHand(testp1Id, ["pillage", "pillage"]);
  const p2base = tg.findBaseId(testp2Id);
  tg.playActions([
    { type: "play", card: "pillage" },
    { type: "choice", target: p2base }
  ]);
  expect(tg.state.log).toContain(
    `\${${testp1Id}} steals 2 gold from \${${testp2Id}}.`
  );
  expect(tg.state.log).toContain("Pillage deals 2 damage to base.");
  expect(tg.state.entities[p2base].damage).toEqual(2);
  expect(tg.state.players[testp1Id].gold).toEqual(5);
  expect(tg.state.players[testp2Id].gold).toEqual(1);
  // Now do it again when opponent has 1 gold left
  tg.playActions([
    { type: "play", card: "pillage" },
    { type: "choice", target: p2base }
  ]);
  expect(tg.state.log).toContain(
    `\${${testp1Id}} steals 1 gold from \${${testp2Id}}.`
  );
  expect(tg.state.log).toContain("Pillage deals 2 damage to base.");
  expect(tg.state.entities[p2base].damage).toEqual(4);
  expect(tg.state.players[testp1Id].gold).toEqual(5);
  expect(tg.state.players[testp2Id].gold).toEqual(0);
});

test("Pillaging yourself doesn't steal any gold", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "jaina_stormborne")
    .putCardsInHand(testp1Id, ["pillage"]);
  const p1base = tg.findBaseId(testp1Id);
  tg.playActions([
    { type: "play", card: "pillage" },
    { type: "choice", target: p1base }
  ]);
  expect(tg.state.log).not.toContain(
    `\${${testp1Id}} steals 1 gold from \${${testp1Id}}.`
  );
  expect(tg.state.log).toContain("Pillage deals 1 damage to base.");
  expect(tg.state.entities[p1base].damage).toEqual(1);
  expect(tg.state.players[testp1Id].gold).toEqual(3);
});

test("Bloodburn gets runes when units die, up to 4", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "bloodburn",
      "captain_zane",
      "iron_man",
      "mad_man"
    ])
    .insertEntities(testp2Id, [
      "older_brother",
      "older_brother",
      "gunpoint_taxman"
    ]);
  const [bb, zane, im, mm, ob1, ob2, gt] = tg.insertedEntityIds;
  expect(tg.state.entities[bb].namedRunes.blood).toBeUndefined();
  tg.playAction({ type: "attack", attacker: mm, target: gt });
  expect(tg.state.log).toContain("Bloodburn gains a blood rune.");
  expect(tg.state.entities[bb].namedRunes.blood).toEqual(1);
  // Note we have to queue the hero death trigger
  tg.playActions([
    { type: "attack", attacker: zane, target: gt },
    { type: "queue", index: 0 }
  ]);
  expect(tg.state.log).toContain("Bloodburn gains a blood rune.");
  expect(tg.state.entities[bb].namedRunes.blood).toEqual(2);
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: ob1, target: im }
  ]);
  expect(tg.state.log).toContain("Bloodburn gains a blood rune.");
  expect(tg.state.entities[bb].namedRunes.blood).toEqual(3);
  tg.playAction({ type: "attack", attacker: ob2, target: im });
  expect(tg.state.newTriggers).toHaveLength(2);
  tg.playAction({ type: "queue", index: 0 });
  expect(tg.state.log).toContain("Bloodburn gains a blood rune.");
  expect(tg.state.entities[bb].namedRunes.blood).toEqual(4);
});
