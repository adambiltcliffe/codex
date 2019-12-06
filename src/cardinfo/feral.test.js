import {
  getGameWithUnits,
  findEntityIds,
  playActions,
  testp1Id,
  testp2Id,
  TestGame
} from "../testutil";

test("Rampaging Elephant readies itself once per turn", () => {
  const tg = new TestGame().insertEntity(testp1Id, "rampaging_elephant");
  const [elephant] = tg.insertedEntityIds;
  const p2Base = tg.findBaseId(testp2Id);
  tg.playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  const s0 = tg.state;
  const s1 = playActions(s0, [
    { type: "attack", attacker: elephant, target: p2Base }
  ]);
  expect(s1.entities[elephant].ready).toEqual(true);
  expect(s1.log).toContain("The Rampaging Elephant readies itself!");
  const s2 = playActions(s1, [
    { type: "attack", attacker: elephant, target: p2Base }
  ]);
  expect(s2.entities[elephant].ready).toEqual(false);
});
