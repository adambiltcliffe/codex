import { TestGame, testp1Id, findEntityIds } from "../testutil";
import { fixtureNames } from "../fixtures";

test("Can't build tech 1 building without 6 workers", () => {
  const tg = new TestGame();
  expect(() => tg.checkAction({ type: "build", fixture: "tech1" })).toThrow();
  tg.setWorkers(testp1Id, 6);
  tg.playAction({ type: "build", fixture: "tech1" });
  expect(() => tg.checkAction({ type: "build", fixture: "tech1" })).toThrow();
  expect(
    findEntityIds(tg.state, e => e.fixture == fixtureNames.tech1).length
  ).toEqual(0);
  expect(tg.state.constructing).toEqual([fixtureNames.tech1]);
  expect(tg.state.log).toContain(
    `\${${testp1Id}} begins construction of tech 1 building.`
  );
  tg.playAction({ type: "endTurn" });
  expect(tg.state.log).toContain("Tech 1 building finishes construction.");
  expect(
    findEntityIds(tg.state, e => e.fixture == fixtureNames.tech1).length
  ).toEqual(1);
});
