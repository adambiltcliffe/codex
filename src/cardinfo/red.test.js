import { TestGame, testp1Id, testp2Id } from "../testutil";

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
