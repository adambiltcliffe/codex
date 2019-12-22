import { TestGame, testp1Id, testp2Id } from "../../testutil";
import { getLegalChoicesForCurrentTrigger } from "../../triggers";

test("Unit with overpower can deal excess damage to another unit", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "iron_man"])
    .insertEntity(testp2Id, "harvest_reaper");
  const [ob, im, hr] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: hr, target: im }
  ]);
  expect(getLegalChoicesForCurrentTrigger(tg.state).sort()).toEqual(
    [ob, p1base].sort()
  );
  tg.playAction({ type: "choice", target: ob });
  expect(tg.state.log).toContain(
    "Harvest Reaper deals 4 damage to Iron Man and 2 overpower damage to Older Brother."
  );
  expect(tg.state.log).toContain("Iron Man dies.");
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).not.toContain("Harvest Reaper dies.");
  expect(tg.state.entities[hr].damage).toEqual(3);
});

test("Overpower damage must go to another patroller if there is one", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "older_brother",
      "older_brother",
      "regularsized_rhinoceros"
    ])
    .insertEntity(testp2Id, "harvest_reaper");
  const [ob1, ob2, rr, hr] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playActions([
    { type: "endTurn", patrollers: [ob1, ob2, rr, null, null] },
    { type: "attack", attacker: hr, target: ob1 }
  ]);
  expect(getLegalChoicesForCurrentTrigger(tg.state).sort()).toEqual(
    [ob2, rr].sort()
  );
  tg.playAction({ type: "choice", target: rr });
  expect(tg.state.entities[rr].damage).toEqual(4);
});

test("Overpower damage ignores flying patrollers", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "older_brother",
      "eggship",
      "regularsized_rhinoceros"
    ])
    .insertEntity(testp2Id, "harvest_reaper");
  const [ob, es, rr, hr] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playActions([
    { type: "endTurn", patrollers: [ob, es, null, null, null] },
    { type: "attack", attacker: hr, target: ob }
  ]);
  expect(getLegalChoicesForCurrentTrigger(tg.state).sort()).toEqual(
    [p1base, rr].sort()
  );
  tg.playAction({ type: "choice", target: p1base });
  expect(tg.state.entities[p1base].damage).toEqual(4);
});

test("Overpower functions correctly when the unit has swift strike", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "iron_man"])
    .insertEntities(testp2Id, ["harvest_reaper", "blademaster"]);
  const [ob, im, hr, bm] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: hr, target: im }
  ]);
  expect(getLegalChoicesForCurrentTrigger(tg.state).sort()).toEqual(
    [ob, p1base].sort()
  );
  tg.playAction({ type: "choice", target: ob });
  expect(tg.state.log).toContain(
    "Harvest Reaper deals 4 swift strike damage to Iron Man and 2 overpower damage to Older Brother."
  );
  expect(tg.state.log).toContain("Iron Man dies.");
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).not.toContain("Harvest Reaper dies.");
  expect(tg.state.entities[hr].damage).toEqual(0);
});

test("Overpower doesn't redirect damage if there are no other targets", () => {
  const tg = new TestGame().insertEntity(testp2Id, "harvest_reaper");
  const [hr] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.modifyEntity(p1base, { damage: 19 }).playActions([
    { type: "endTurn" },
    { type: "attack", attacker: hr, target: p1base }
  ]);
  expect(tg.state.log).toContain(
    "Choose where to deal excess damage with overpower: No legal choices."
  );
  expect(tg.state.log).toContain("Harvest Reaper deals 6 damage to base.");
  expect(tg.state.entities[p1base].damage).toEqual(25);
});

test("Overpower doesn't create a prompt if attacker damage < lethal", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "regularsized_rhinoceros")
    .insertEntity(testp2Id, "harvest_reaper");
  const [rr, hr] = tg.insertedEntityIds;
  tg.modifyEntity(rr, { runes: 1 }).playActions([
    { type: "endTurn" },
    { type: "attack", attacker: hr, target: rr }
  ]);
  expect(tg.state.currentAttack).toBeNull();
  expect(tg.state.currentTrigger).toBeNull();
  expect(tg.state.entities[rr].damage).toEqual(6);
  expect(tg.state.log).toContain("Harvest Reaper dies.");
});

test("Overpower doesn't create a prompt if attacker damage = lethal", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "regularsized_rhinoceros")
    .insertEntity(testp2Id, "harvest_reaper");
  const [rr, hr] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: hr, target: rr }
  ]);
  expect(tg.state.currentAttack).toBeNull();
  expect(tg.state.currentTrigger).toBeNull();
  expect(tg.state.log).toContain("Regular-sized Rhinoceros dies.");
  expect(tg.state.log).toContain("Harvest Reaper dies.");
});
