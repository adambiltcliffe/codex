import { TestGame, testp1Id, testp2Id } from "../../testutil";

test("Unit with sparkshot can attack Squad Leader and deal damage to adjacent patroller", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "timely_messenger"])
    .insertEntity(testp2Id, "revolver_ocelot");
  const [ob, tm, ro] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [ob, tm, null, null, null] },
    { type: "attack", attacker: ro, target: ob }
  ]);
  expect(tg.state.log).toContain(
    "Choose a patroller to receive sparkshot damage: Only one legal choice."
  );
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).toContain("Timely Messenger dies.");
  expect(tg.state.log).not.toContain("Revolver Ocelot dies.");
  expect(tg.state.entities[ro].damage).toEqual(2);
});

test("Unit with sparkshot can attack Lookout and deal damage to adjacent patroller", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "timely_messenger"])
    .insertEntity(testp2Id, "revolver_ocelot");
  const [ob, tm, ro] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, null, null, tm, ob] },
    { type: "attack", attacker: ro, target: ob }
  ]);
  expect(tg.state.log).toContain(
    "Choose a patroller to receive sparkshot damage: Only one legal choice."
  );
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).toContain("Timely Messenger dies.");
  expect(tg.state.log).not.toContain("Revolver Ocelot dies.");
  expect(tg.state.entities[ro].damage).toEqual(2);
});

test("Unit with sparkshot can attack middle patroller and choose where to deal damage", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "older_brother",
      "timely_messenger",
      "brick_thief"
    ])
    .insertEntity(testp2Id, "revolver_ocelot");
  const [ob, tm, bt, ro] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, bt, ob, tm, null] },
    { type: "attack", attacker: ro, target: ob }
  ]);
  expect(tg.getLegalChoices().sort()).toEqual([bt, tm].sort());
  tg.playAction({ type: "choice", target: bt });
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).toContain("Brick Thief dies.");
  expect(tg.state.log).not.toContain("Revolver Ocelot dies.");
  expect(tg.state.entities[ro].damage).toEqual(2);
});

test("Unit with sparkshot can attack middle patroller and choose only target automatically", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "timely_messenger"])
    .insertEntity(testp2Id, "revolver_ocelot");
  const [ob, tm, ro] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, null, ob, tm, null] },
    { type: "attack", attacker: ro, target: ob }
  ]);
  expect(tg.state.log).toContain(
    "Choose a patroller to receive sparkshot damage: Only one legal choice."
  );
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).toContain("Timely Messenger dies.");
  expect(tg.state.log).not.toContain("Revolver Ocelot dies.");
  expect(tg.state.entities[ro].damage).toEqual(2);
});

test("Unit with sparkshot can attack solitary patroller", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "older_brother")
    .insertEntity(testp2Id, "revolver_ocelot");
  const [ob, ro] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, null, ob, null, null] },
    { type: "attack", attacker: ro, target: ob }
  ]);
  expect(tg.state.log).toContain(
    "Choose a patroller to receive sparkshot damage: No legal choices."
  );
  expect(tg.state.entities[ob]).toBeUndefined();
  expect(tg.state.entities[ro].damage).toEqual(2);
});

test("Choosing a sparkshot target doesn't make you pay resist", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "timely_messenger"])
    .insertEntity(testp2Id, "revolver_ocelot");
  const [ob, tm, ro] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, null, null, ob, tm] },
    { type: "attack", attacker: ro, target: ob }
  ]);
  expect(tg.state.log).toContain(
    "Choose a patroller to receive sparkshot damage: Only one legal choice."
  );
  expect(tg.state.players[testp2Id].gold).toEqual(5);
});

test("Unit with sparkshot still deals its damage if it has swift strike", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "older_brother",
      "timely_messenger",
      "brick_thief"
    ])
    .insertEntities(testp2Id, ["revolver_ocelot", "blademaster"]);
  const [ob, tm, bt, ro, bm] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, bt, ob, tm, null] },
    { type: "attack", attacker: ro, target: ob }
  ]);
  expect(tg.getLegalChoices().sort()).toEqual([bt, tm].sort());
  tg.playAction({ type: "choice", target: bt });
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).toContain("Brick Thief dies.");
  expect(tg.state.log).not.toContain("Revolver Ocelot dies.");
  expect(tg.state.entities[ro].damage).toEqual(0);
});
