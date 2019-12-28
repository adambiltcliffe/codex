import { TestGame, testp1Id, testp2Id } from "../testutil";
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
