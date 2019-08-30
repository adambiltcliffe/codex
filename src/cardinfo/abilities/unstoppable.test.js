import { TestGame, testp1Id, testp2Id } from "../../testutil";
import { getAttackableEntityIds } from "../../actions/attack";
import { fixtureNames } from "../../fixtures";

test("Unstoppable units can attack regardless of patrollers", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "older_brother",
      "tenderfoot",
      "fox_primus",
      "troq_bashar",
      "river_montoya"
    ])
    .insertEntity(testp2Id, "angry_dancer_token");
  const [ob, tf, fp, troq, river, token] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playAction({ type: "endTurn", patrollers: [ob, tf, troq, null, null] });
  expect(
    getAttackableEntityIds(tg.state, tg.state.entities[token]).sort()
  ).toEqual([p1base, ob, tf, fp, troq, river].sort());
});

test("Unstoppable units still can't attack flyers", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "tenderfoot", "eggship"])
    .insertEntity(testp2Id, "angry_dancer_token");
  const [ob, tf, es, token] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playAction({ type: "endTurn", patrollers: [ob, null, null, null, null] });
  expect(
    getAttackableEntityIds(tg.state, tg.state.entities[token]).sort()
  ).toEqual([p1base, ob, tf].sort());
});

test("Unstoppable units don't trigger tower detection but do take damage", () => {
  const tg = new TestGame()
    .insertFixture(testp1Id, fixtureNames.tower)
    .insertEntity(testp1Id, "older_brother")
    .insertEntity(testp2Id, "angry_dancer_token");
  const [tower, ob, token] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  tg.playActions([
    { type: "endTurn", patrollers: [ob, null, null, null, null] },
    {
      type: "attack",
      attacker: token,
      target: p1base
    }
  ]);
  expect(tg.state.log).toContain("Tower deals 1 damage to Angry Dancer.");
  expect(tg.state.log).not.toContain("Angry Dancer is detected by tower.");
  expect(tg.state.entities[token]).toBeUndefined();
  expect(tg.state.entities[tower].thisTurn.usedDetector).toBeFalsy();
});
