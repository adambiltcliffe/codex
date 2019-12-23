import { TestGame, testp1Id, testp2Id } from "../testutil";

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
