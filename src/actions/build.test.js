import { TestGame, testp1Id, findEntityIds, testp2Id } from "../testutil";
import { fixtureNames } from "../fixtures";

test("Can't build tech 1 building without 6 workers", () => {
  const tg = new TestGame();
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tech1 })
  ).toThrow();
  tg.setWorkers(testp1Id, 6);
  tg.playAction({ type: "build", fixture: fixtureNames.tech1 });
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tech1 })
  ).toThrow();
  expect(
    findEntityIds(tg.state, e => e.fixture == fixtureNames.tech1).length
  ).toEqual(0);
  expect(tg.state.constructing).toEqual([fixtureNames.tech1]);
  expect(tg.state.log).toContain(
    `\${${testp1Id}} begins construction of tech I building.`
  );
  tg.playAction({ type: "endTurn" });
  expect(tg.state.log).toContain("Tech I building finishes construction.");
  expect(
    findEntityIds(tg.state, e => e.fixture == fixtureNames.tech1).length
  ).toEqual(1);
});

test("Can rebuild tech 1 building for free", () => {
  const tg = new TestGame()
    .insertEntity(testp2Id, "blademaster")
    .setWorkers(testp1Id, 6);
  const [bm] = tg.insertedEntityIds;
  tg.playActions([
    { type: "build", fixture: fixtureNames.tech1 },
    { type: "endTurn" }
  ]);
  expect(tg.state.players[testp1Id].gold).toEqual(3);
  const p1t1 = tg.state.players[testp1Id].current.fixtures[fixtureNames.tech1];
  expect(tg.state.entities[p1t1]).not.toBeUndefined();
  tg.playAction({ type: "attack", attacker: bm, target: p1t1 });
  expect(tg.state.entities[p1t1]).toBeUndefined();
  expect(tg.state.players[testp1Id].current.fixtures[p1t1]).toBeUndefined();
  tg.playActions([
    { type: "endTurn" },
    { type: "build", fixture: fixtureNames.tech1 },
    { type: "endTurn" }
  ]);
  expect(tg.state.players[testp1Id].gold).toEqual(9);
  const p1t1b = tg.state.players[testp1Id].current.fixtures[fixtureNames.tech1];
  expect(tg.state.entities[p1t1b]).not.toBeUndefined();
  expect(p1t1).not.toEqual(p1t1b);
});

test("Building prerequisites for tech 2 and tech 3 buildings", () => {
  const tg = new TestGame()
    .setWorkers(testp1Id, 10)
    .playAction({ type: "build", fixture: fixtureNames.tech1 });
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tech2 })
  ).toThrow();
  tg.playActions([
    { type: "endTurn" },
    { type: "endTurn" },
    { type: "build", fixture: fixtureNames.tech2 }
  ]);
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tech3 })
  ).toThrow();
  tg.playActions([
    { type: "endTurn" },
    { type: "endTurn" },
    { type: "build", fixture: fixtureNames.tech3 },
    { type: "endTurn" }
  ]);
  expect(
    Object.keys(tg.state.players[testp1Id].current.fixtures).sort()
  ).toEqual(
    [
      fixtureNames.base,
      fixtureNames.tech1,
      fixtureNames.tech2,
      fixtureNames.tech3
    ].sort()
  );
});

test("Gold costs for tech buildings", () => {
  const tg = new TestGame().setWorkers(testp1Id, 10).setGold(testp1Id, 0);
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tech1 })
  ).toThrow();
  tg.setGold(testp1Id, 1);
  tg.playActions([
    { type: "build", fixture: fixtureNames.tech1 },
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  tg.setGold(testp1Id, 3);
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tech2 })
  ).toThrow();
  tg.setGold(testp1Id, 4);
  tg.playActions([
    { type: "build", fixture: fixtureNames.tech2 },
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  tg.setGold(testp1Id, 4);
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tech3 })
  ).toThrow();
  tg.setGold(testp1Id, 5);
  tg.playAction({ type: "build", fixture: fixtureNames.tech3 });
});

test("Worker thresholds for tech buildings", () => {
  const tg = new TestGame().setWorkers(testp1Id, 5).setGold(testp1Id, 20);
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tech1 })
  ).toThrow();
  tg.setWorkers(testp1Id, 6);
  tg.playActions([
    { type: "build", fixture: fixtureNames.tech1 },
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tech2 })
  ).toThrow();
  tg.setWorkers(testp1Id, 8);
  tg.playActions([
    { type: "build", fixture: fixtureNames.tech2 },
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tech3 })
  ).toThrow();
  tg.setWorkers(testp1Id, 10);
  tg.playAction({ type: "build", fixture: fixtureNames.tech3 });
});

test("Can build a surplus", () => {
  const tg = new TestGame().setGold(testp1Id, 5).playAction({
    type: "build",
    fixture: fixtureNames.surplus
  });
  expect(
    findEntityIds(tg.state.entities, e => e.fixture == fixtureNames.surplus)
      .length
  ).toEqual(0);
  expect(tg.state.log).toContain(
    `\${${testp1Id}} begins construction of surplus.`
  );
  tg.playAction({ type: "endTurn" });
  expect(
    findEntityIds(tg.state.entities, e => e.fixture == fixtureNames.surplus)
      .length
  ).toEqual(0);
  expect(tg.state.log).toContain("Surplus finishes construction.");
});

test("Can't start constructing two different add-ons in the same turn", () => {
  const tg = new TestGame()
    .setGold(testp1Id, 20)
    .playAction({ type: "build", fixture: fixtureNames.surplus });
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tower })
  ).toThrow("Already constructing an add-on.");
});

test("Can't start constructing two identical add-ons in the same turn", () => {
  const tg = new TestGame()
    .setGold(testp1Id, 20)
    .playAction({ type: "build", fixture: fixtureNames.surplus });
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.surplus })
  ).toThrow("Already under construction.");
});

test("Can replace existing add-on, dealing 2 damage to base", () => {
  const tg = new TestGame()
    .insertFixture(testp1Id, fixtureNames.surplus)
    .playAction({ type: "build", fixture: fixtureNames.tower });
  const p1base = tg.findBaseId(testp1Id);
  expect(tg.state.log).toContain("Surplus is destroyed.");
  expect(tg.state.entities[p1base].damage).toEqual(2);
  expect(tg.state.constructing).toContain(fixtureNames.tower);
});

test("Can't replace existing add-on with the same add-on", () => {
  const tg = new TestGame().insertFixture(testp1Id, fixtureNames.tower);
  expect(() =>
    tg.checkAction({ type: "build", fixture: fixtureNames.tower })
  ).toThrow("Already built.");
});
