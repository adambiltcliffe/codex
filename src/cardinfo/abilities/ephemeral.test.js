import { TestGame, testp1Id, testp2Id } from "../../testutil";
import { getAP } from "../../util";

test("Ephemeral unit dies at end of turn", () => {
  const tg = new TestGame().insertEntity(testp1Id, "crashbarrow");
  const [cb] = tg.insertedEntityIds;
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[cb]).toBeUndefined();
  expect(tg.state.log).toContain(
    "Triggered action of Crashbarrow (ephemeral) was added to the queue."
  );
  expect(tg.state.log).toContain("Crashbarrow dies.");
});

test("Ephemeral unit can patrol but dies without generating bonuses", () => {
  const tg = new TestGame().insertEntities(testp1Id, [
    "mad_man",
    "shoddy_glider",
    "crashbarrow"
  ]);
  const [mm, sg, cb] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [null, mm, sg, cb, null] },
    { type: "queue", index: 0 }
  ]);
  expect(tg.state.entities[sg]).toBeUndefined();
  expect(tg.state.log).toContain("Shoddy Glider dies.");
  expect(tg.state.entities[cb]).toBeUndefined();
  expect(tg.state.log).toContain("Crashbarrow dies.");
  expect(tg.state.players[testp1Id].patrollerIds).toEqual([
    null,
    mm,
    null,
    null,
    null
  ]);
  expect(getAP(tg.state).id).toEqual(testp2Id);
  expect(tg.state.newTriggers).toHaveLength(0);
  expect(tg.state.queue).toHaveLength(0);
  expect(tg.state.log).not.toContain(
    "Triggered action (Scavenger dies: Gain ①.) was added to the queue."
  );
  expect(tg.state.log).not.toContain(
    "Triggered action (Technician dies: Draw a card.) was added to the queue."
  );
  expect(tg.state.players[testp1Id].gold).toEqual(4);
  expect(tg.state.players[testp1Id].hand).toHaveLength(5);
});
