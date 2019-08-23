import { testp2Id, TestGame, testp1Id } from "../../testutil";

test("Unit with readiness can attack without exhausting but only once", () => {
  const tg = new TestGame().insertEntity(testp1Id, "argonaut");
  const [a] = tg.insertedEntityIds;
  const p2base = tg.findBaseId(testp2Id);
  tg.playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  expect(tg.state.entities[a].ready).toBeTruthy();
  tg.playAction({ type: "attack", attacker: a, target: p2base });
  expect(tg.state.entities[a].ready).toBeTruthy();
  expect(() =>
    tg.checkAction({ type: "attack", attacker: a, target: p2base })
  ).toThrow();
});

test("Unit with readiness still can't attack if exhausted", () => {
  const tg = new TestGame().insertEntity(testp1Id, "argonaut");
  const [a] = tg.insertedEntityIds;
  const p2base = tg.findBaseId(testp2Id);
  tg.playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  tg.modifyEntity(a, { ready: false });
  expect(() =>
    tg.checkAction({ type: "attack", attacker: a, target: p2base })
  ).toThrow("exhausted");
});
