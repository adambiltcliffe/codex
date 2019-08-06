import { testp2Id, testp1Id, TestGame } from "../testutil";

test("Jaina at level 1 has sparkshot", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "timely_messenger"])
    .insertEntity(testp2Id, "jaina_stormborne");
  const [ob, tm, jaina] = tg.insertedEntityIds;
  expect(tg.state.entities[jaina].current.abilities.length).toEqual(1);
  tg.playActions([
    { type: "endTurn", patrollers: [ob, tm, null, null, null] },
    { type: "attack", attacker: jaina, target: ob }
  ]);
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).toContain("Timely Messenger dies.");
});

test("Jaina's level 4 ability can deal 1 to patroller or building", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "timely_messenger"])
    .insertEntity(testp2Id, "jaina_stormborne");
  const [ob, tm, jaina] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  const p2base = tg.findBaseId(testp2Id);
  tg.modifyEntity(jaina, { level: 4 });
  expect(tg.state.entities[jaina].current.abilities.length).toEqual(2);
  tg.playActions([
    { type: "endTurn", patrollers: [ob, null, null, null, null] },
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
