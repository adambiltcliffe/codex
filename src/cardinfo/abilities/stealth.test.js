import { TestGame, testp1Id, testp2Id } from "../../testutil";
import { fixtureNames } from "../../fixtures";

test("Stealth unit can't attack backline if tower has unused detector", () => {
  const tg = new TestGame()
    .insertFixture(testp1Id, fixtureNames.tower)
    .insertEntity(testp1Id, "older_brother")
    .insertEntity(testp2Id, "chameleon");
  const [tower, ob, ch] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  expect(tg.state.entities[tower].thisTurn.usedDetector).toBeFalsy();
  tg.playAction({ type: "endTurn", patrollers: [ob, null, null, null, null] });
  expect(tg.state.entities[tower].thisTurn.usedDetector).toBeFalsy();
  expect(() =>
    tg.checkAction({ type: "attack", attacker: ch, target: p1base })
  ).toThrow("legal target");
});

test("Stealth unit can't attack backline if previously detected", () => {
  const tg = new TestGame()
    .insertFixture(testp1Id, fixtureNames.tower)
    .insertEntities(testp1Id, ["older_brother", "tenderfoot"])
    .insertEntity(testp2Id, "chameleon");
  const [tower, ob, tf, ch] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  expect(tg.state.entities[tower].usedDetector).toBeFalsy();
  tg.playActions([
    { type: "endTurn", patrollers: [null, ob, tf, null, null] },
    { type: "attack", attacker: ch, target: tf }
  ]);
  expect(tg.state.log).toContain("Chameleon is detected by tower.");
  expect(tg.state.entities[ch].thisTurn.detected).toBeTruthy();
  expect(tg.state.entities[tower].thisTurn.usedDetector).toBeTruthy();
  tg.modifyEntity(ch, { ready: true });
  expect(() =>
    tg.checkAction({ type: "attack", attacker: ch, target: p1base })
  ).toThrow("legal target");
  expect(() =>
    tg.checkAction({ type: "attack", attacker: ch, target: ob })
  ).not.toThrow();
});

test("Stealth unit can attack backline if tower has used detector (and doesn't take damage)", () => {
  const tg = new TestGame()
    .insertFixture(testp1Id, fixtureNames.tower)
    .insertEntity(testp1Id, "iron_man")
    .insertEntities(testp2Id, ["chameleon", "chameleon"]);
  const [tower, im, ch1, ch2] = tg.insertedEntityIds;
  const p1base = tg.findBaseId(testp1Id);
  expect(tg.state.entities[tower].usedDetector).toBeFalsy();
  tg.playAction({ type: "endTurn", patrollers: [im, null, null, null, null] });
  tg.playAction({ type: "attack", attacker: ch1, target: im });
  expect(tg.state.log).toContain("Chameleon is detected by tower.");
  expect(tg.state.log).toContain("Tower deals 1 damage to Chameleon.");
  tg.playAction({ type: "attack", attacker: ch2, target: p1base });
  expect(tg.state.log).not.toContain("Chameleon is detected by tower.");
  expect(tg.state.log).not.toContain("Tower deals 1 damage to Chameleon.");
  expect(tg.state.entities[ch2].thisTurn.detected).toBeFalsy();
});
