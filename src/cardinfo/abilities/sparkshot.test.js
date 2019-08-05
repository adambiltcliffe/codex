import { TestGame, testp1Id, testp2Id } from "../../testutil";

test("Unit with sparkshot can deal damage to adjacent patroller", () => {
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
