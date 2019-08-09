import { TestGame, testp1Id, testp2Id } from "../../testutil";

test("Two units that both have swift strike trade in combat", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "glorious_ninja")
    .insertEntity(testp2Id, "glorious_ninja");
  const [gn1, gn2] = tg.insertedEntityIds;
  tg.playAction({ type: "attack", attacker: gn1, target: gn2 });
  expect(tg.state.log.filter(m => m == "Glorious Ninja dies.").length).toEqual(
    2
  );
  expect(tg.state.entities[gn1]).toBeUndefined();
  expect(tg.state.entities[gn2]).toBeUndefined();
});

test("Attacker with swift strike doesn't take any damage", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "glorious_ninja")
    .insertEntity(testp2Id, "iron_man");
  const [gn, im] = tg.insertedEntityIds;
  tg.playAction({ type: "attack", attacker: gn, target: im });
  expect(tg.state.log).toContain("Iron Man dies.");
  expect(tg.state.log).not.toContain("Glorious Ninja dies.");
  expect(tg.state.entities[gn].damage).toEqual(0);
  expect(tg.state.entities[im]).toBeUndefined();
});

test("Attacker with flying and swift strike can be killed by anti-air afterwards", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "leaping_lizard"])
    .insertEntities(testp2Id, ["eggship", "blademaster"]);
  const [ob, ll, es, bm] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [ll, null, null, null, null] },
    { type: "attack", attacker: es, target: ob }
  ]);
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).not.toContain(
    "Older Brother deals 2 damage to Eggship."
  );
  expect(tg.state.log).toContain("Leaping Lizard deals 3 damage to Eggship.");
  expect(tg.state.log).toContain("Eggship dies.");
});

test("Attacker with flying and swift strike takes damage from anti-air afterwards", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "fox_primus"])
    .insertEntities(testp2Id, ["eggship", "blademaster"]);
  const [ob, fp, es, bm] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [fp, null, null, null, null] },
    { type: "attack", attacker: es, target: ob }
  ]);
  expect(tg.state.log).toContain("Eggship deals 4 damage to Older Brother.");
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).not.toContain(
    "Older Brother deals 2 damage to Eggship."
  );
  expect(tg.state.log).toContain("Fox Primus deals 2 damage to Eggship.");
  expect(tg.state.log).not.toContain("Eggship dies.");
  expect(tg.state.entities[es].damage).toEqual(2);
});

//Attacker dies before dealing damage if defender has swift strike
//Attacker dies before dealing damage if flown-over with swift strike
