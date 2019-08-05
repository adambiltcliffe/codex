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
  expect(tg.state.log).toContain("Iron Man dies.");
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.state.log).not.toContain("Harvest Reaper dies.");
  expect(tg.state.entities[hr].damage).toEqual(3);
});
