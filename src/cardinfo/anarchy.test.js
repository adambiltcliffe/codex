import { TestGame, testp1Id, testp2Id, findEntityIds } from "../testutil";
import { getAP } from "../util";

test("Surprise Attack creates two Shark tokens with haste and ephemeral", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "captain_zane")
    .putCardsInHand(testp1Id, ["surprise_attack"])
    .setGold(testp1Id, 5);
  const p2base = tg.findBaseId(testp2Id);
  tg.playAction({ type: "play", card: "surprise_attack" });
  const sharks = findEntityIds(tg.state, e => e.card == "shark_token");
  expect(sharks).toHaveLength(2);
  const [st1, st2] = sharks;
  tg.playAction({ type: "attack", attacker: st1, target: p2base });
  expect(tg.state.entities[p2base].damage).toEqual(3);
  expect(tg.state.log).toContain("Shark deals 3 damage to base.");
  tg.playAction({ type: "endTurn" });
  expect(getAP(tg.state).id).toEqual(testp1Id);
  expect(tg.state.newTriggers).toHaveLength(2);
  tg.playAction({ type: "queue", index: 0 });
  expect(tg.state.log).toContain("Shark dies.");
  expect(tg.state.entities[st1]).toBeUndefined();
  expect(tg.state.entities[st2]).toBeUndefined();
  expect(getAP(tg.state).id).toEqual(testp2Id);
});

test("Maximum Anarchy destroys everything", () => {
  expect.assertions(10);
  const tg = new TestGame()
    .insertEntities(testp1Id, ["captain_zane", "jaina_stormborne", "mad_man"])
    .insertEntities(testp2Id, ["troq_bashar", "iron_man"]);
  const [zane, jaina, mm, troq, im] = tg.insertedEntityIds;
  tg.modifyEntity(zane, { level: 6, controlledSince: -1, maxedSince: -1 })
    .putCardsInHand(testp1Id, ["maximum_anarchy"])
    .playAction({ type: "play", card: "maximum_anarchy" });
  tg.insertedEntityIds.forEach(id =>
    expect(tg.state.entities[id]).toBeUndefined()
  );
  [
    "Captain Zane",
    "Jaina Stormborne",
    "Mad Man",
    "Troq Bashar",
    "Iron Man"
  ].forEach(n => expect(tg.state.log).toContain(`${n} dies.`));
});

test("Gunpoint Taxman steals 1 gold when killing a patroller", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "older_brother")
    .insertEntity(testp2Id, "gunpoint_taxman");
  const [ob, gt] = tg.insertedEntityIds;
  tg.playAction({ type: "endTurn", patrollers: [ob, null, null, null, null] });
  const g1 = tg.state.players[testp1Id].gold;
  const g2 = tg.state.players[testp2Id].gold;
  tg.playAction({ type: "attack", attacker: gt, target: ob });
  expect(tg.state.log).toContain(
    `\${${testp2Id}} steals 1 gold from \${${testp1Id}}.`
  );
  expect(tg.state.players[testp1Id].gold).toEqual(g1 - 1);
  expect(tg.state.players[testp2Id].gold).toEqual(g2 + 1);
});

test("Gunpoint Taxman doesn't steal if damaging but not killing patroller", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "gunpoint_taxman");
  const [im, gt] = tg.insertedEntityIds;
  tg.playAction({ type: "endTurn", patrollers: [null, im, null, null, null] });
  const g1 = tg.state.players[testp1Id].gold;
  const g2 = tg.state.players[testp2Id].gold;
  tg.playAction({ type: "attack", attacker: gt, target: im });
  expect(tg.state.log).not.toContain(
    `\${${testp2Id}} steals 1 gold from \${${testp1Id}}.`
  );
  expect(tg.state.players[testp1Id].gold).toEqual(g1);
  expect(tg.state.players[testp2Id].gold).toEqual(g2);
});

test("Gunpoint Taxman doesn't steal if killing non-patroller or if someone else kills patroller", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["fruit_ninja", "older_brother"])
    .insertEntities(testp2Id, ["iron_man", "gunpoint_taxman"]);
  const [fn, ob, im, gt] = tg.insertedEntityIds;
  tg.playAction({ type: "endTurn", patrollers: [fn, null, null, null, null] });
  const g1 = tg.state.players[testp1Id].gold;
  const g2 = tg.state.players[testp2Id].gold;
  tg.playAction({ type: "attack", attacker: im, target: fn });
  expect(tg.state.log).not.toContain(
    `\${${testp2Id}} steals 1 gold from \${${testp1Id}}.`
  );
  expect(tg.state.players[testp1Id].gold).toEqual(g1);
  expect(tg.state.players[testp2Id].gold).toEqual(g2);
  tg.playAction({ type: "attack", attacker: gt, target: ob });
  expect(tg.state.log).not.toContain(
    `\${${testp2Id}} steals 1 gold from \${${testp1Id}}.`
  );
  expect(tg.state.players[testp1Id].gold).toEqual(g1);
  expect(tg.state.players[testp2Id].gold).toEqual(g2);
});

test("Gunpoint Taxman steals even if he dies", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "revolver_ocelot")
    .insertEntity(testp2Id, "gunpoint_taxman");
  const [ro, gt] = tg.insertedEntityIds;
  tg.playAction({ type: "endTurn", patrollers: [null, null, null, null, ro] });
  const g1 = tg.state.players[testp1Id].gold;
  const g2 = tg.state.players[testp2Id].gold;
  tg.playAction({ type: "attack", attacker: gt, target: ro });
  expect(tg.state.log).toContain(
    `\${${testp2Id}} steals 1 gold from \${${testp1Id}}.`
  );
  expect(tg.state.players[testp1Id].gold).toEqual(g1 - 1);
  expect(tg.state.players[testp2Id].gold).toEqual(g2 + 1);
  expect(tg.state.log).toContain("Gunpoint Taxman dies.");
});
