import { testp2Id, testp1Id, TestGame } from "../testutil";

test("Troq at level 1 has no abilities", () => {
  const tg = new TestGame().insertEntity(testp2Id, "troq_bashar");
  const [troq] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: p1base }
  ]);
  expect(tg.state.entities[p1base].damage).toEqual(2);
});

test("Troq at level 5 deals extra damage when attacking base", () => {
  const tg = new TestGame().insertEntity(testp2Id, "troq_bashar");
  const [troq] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.modifyEntity(troq, { level: 5 }).playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: p1base }
  ]);
  expect(tg.state.log).toContain(
    "Triggered action from Troq Bashar was added to the queue."
  );
  expect(tg.state.log).toContain("Troq Bashar deals 1 damage to base.");
  expect(tg.state.entities[p1base].damage).toEqual(4);
});

test("Troq at level 5 deals damage to base when attacking other things", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "troq_bashar");
  const [im, troq] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.modifyEntity(troq, { level: 5 }).playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im }
  ]);
  expect(tg.state.log).toContain(
    "Triggered action from Troq Bashar was added to the queue."
  );
  expect(tg.state.log).toContain("Troq Bashar deals 1 damage to base.");
  expect(tg.state.entities[p1base].damage).toEqual(1);
  expect(tg.state.entities[im].damage).toEqual(3);
  expect(tg.state.entities[troq].damage).toEqual(3);
  expect(tg.state.entities[troq].ready).toBeFalsy();
});

test("Troq at level 8 deals damage to base and has readiness", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "troq_bashar");
  const [im, troq] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.modifyEntity(troq, { level: 8 }).playActions([
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im }
  ]);
  expect(tg.state.log).toContain(
    "Triggered action from Troq Bashar was added to the queue."
  );
  expect(tg.state.log).toContain("Troq Bashar deals 1 damage to base.");
  expect(tg.state.entities[p1base].damage).toEqual(1);
  expect(tg.state.entities[im]).toBeUndefined();
  expect(tg.state.entities[troq].damage).toEqual(3);
  expect(tg.state.entities[troq].ready).toBeTruthy();
});
