import { testp2Id, testp1Id, TestGame } from "../testutil";
import { isPatrolling } from "../patrolzone";
import { getAttackableEntityIds } from "../actions/attack";

test("Troq at level 1 has no abilities", () => {
  const tg = new TestGame().insertEntity(testp2Id, "troq_bashar");
  const [troq] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: p1base }
  ]);
  expect(tg.state.entities[p1base].damage).toEqual(2);
});

test("Troq at level 5 deals extra damage when attacking base", () => {
  const tg = new TestGame().insertEntity(testp2Id, "troq_bashar");
  const [troq] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.modifyEntity(troq, { level: 5 }).playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: p1base }
  ]);
  expect(tg.state.log).toContain(
    "Triggered action from Troq Bashar was added to the queue."
  );
  expect(tg.state.log).toContain("Troq Bashar deals 1 damage to base.");
  expect(tg.state.entities[p1base].damage).toEqual(4);
});

test("Troq at level 5 deals damage to base when attacking other things", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "troq_bashar");
  const [im, troq] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.modifyEntity(troq, { level: 5 }).playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im }
  ]);
  expect(tg.state.log).toContain(
    "Triggered action from Troq Bashar was added to the queue."
  );
  expect(tg.state.log).toContain("Troq Bashar deals 1 damage to base.");
  expect(tg.state.entities[p1base].damage).toEqual(1);
  expect(tg.state.entities[im].damage).toEqual(3);
  expect(tg.state.entities[troq].damage).toEqual(3);
  expect(tg.state.entities[troq].ready).toBeFalsy();
});

test("Troq at level 8 deals damage to base and has readiness", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "troq_bashar");
  const [im, troq] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.modifyEntity(troq, { level: 8 }).playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im }
  ]);
  expect(tg.state.log).toContain(
    "Triggered action from Troq Bashar was added to the queue."
  );
  expect(tg.state.log).toContain("Troq Bashar deals 1 damage to base.");
  expect(tg.state.entities[p1base].damage).toEqual(1);
  expect(tg.state.entities[im]).toBeUndefined();
  expect(tg.state.entities[troq].damage).toEqual(3);
  expect(tg.state.entities[troq].ready).toBeTruthy();
});

test("River at level 1 has no abilities", () => {
  const tg = new TestGame().insertEntity(testp1Id, "river_montoya");
  const [river] = tg.insertedEntityIds;
  expect(tg.state.entities[river].current.abilities.length).toEqual(0);
});

test("River at level 3 can sideline a patroller", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "older_brother")
    .insertEntity(testp2Id, "river_montoya");
  const [ob, river] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.modifyEntity(river, { level: 3 });
  tg.playActions([
    { type: "endTurn", patrollers: [ob, null, null, null, null] },
    { type: "activate", source: river, index: 0 }
  ]);
  expect(tg.state.log).toContain(
    "Choose a tech 0 or tech 1 patroller to sideline: Only one legal choice."
  );
  expect(isPatrolling(tg.state, tg.state.entities[ob])).toBeFalsy();
  expect(
    getAttackableEntityIds(tg.state, tg.state.entities[river]).sort()
  ).toEqual([ob, p1base].sort());
});

test("River's level 3 ability can target tech 0 or 1 but not 2 or 3 units", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "older_brother",
      "iron_man",
      "eggship",
      "trojan_duck"
    ])
    .insertEntity(testp2Id, "river_montoya");

  const [ob, im, es, td, river] = tg.insertedEntityIds;
  tg.modifyEntity(river, { level: 3 }).playActions([
    { type: "endTurn", patrollers: [ob, im, es, td, null] },
    { type: "activate", source: river, index: 0 }
  ]);
  expect(tg.getLegalChoices().sort()).toEqual([ob, im].sort());
});

test("River at level 5 gives cost reduction on Tech 0 units", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "river_montoya")
    .putCardsInHand(testp1Id, ["older_brother", "tiger_cub", "nimble_fencer"])
    .setGold(testp1Id, 1);
  const [river] = tg.insertedEntityIds;
  tg.modifyEntity(river, { level: 5 });
  expect(() =>
    tg.checkAction({ type: "play", card: "older_brother" })
  ).not.toThrow();
  expect(() =>
    tg.checkAction({ type: "play", card: "tiger_cub" })
  ).not.toThrow();
  expect(() =>
    tg.checkAction({ type: "play", card: "nimble_fencer" })
  ).toThrow();
  tg.playAction({ type: "play", card: "older_brother" });
  expect(tg.state.players[testp1Id].gold).toEqual(0);
});

test("River at level 5 doesn't give cost reduction to the opponent", () => {
  const tg = new TestGame()
    .insertEntity(testp2Id, "river_montoya")
    .putCardsInHand(testp1Id, ["older_brother", "tiger_cub", "nimble_fencer"])
    .setGold(testp1Id, 1);
  const [river] = tg.insertedEntityIds;
  tg.modifyEntity(river, { level: 5 });
  expect(() =>
    tg.checkAction({ type: "play", card: "older_brother" })
  ).toThrow();
  expect(() => tg.checkAction({ type: "play", card: "tiger_cub" })).toThrow();
});
