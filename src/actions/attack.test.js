import CodexGame from "../codex";
import {
  findEntityIds,
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  testp2Id
} from "../testutil";
import { fixtureNames } from "../fixtures";

test("Arrival fatigue and attacking base", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "iron_man");
  const s1 = playActions(s0, [{ type: "play", card: "iron_man" }]);
  const im = findEntityIds(
    s1,
    e => e.owner == testp1Id && e.card == "iron_man"
  )[0];
  const p2base = findEntityIds(
    s1,
    e => e.owner == testp2Id && e.fixture == fixtureNames.base
  )[0];
  expect(() =>
    CodexGame.checkAction(s1, { type: "attack", attacker: im, target: p2base })
  ).toThrow();
  const s2 = playActions(s1, [
    { type: "endTurn" },
    { type: "endTurn" },
    { type: "attack", attacker: im, target: p2base }
  ]);
  expect(s2.entities[p2base].damage).toEqual(3);
  expect(s2.log).toContain(`\${${testp1Id}} declares an attack with Iron Man.`);
  expect(s2.log).toContain("Iron Man attacks base.");
});

test("Base can't attack", () => {
  const s0 = getNewGame();
  const p1base = findEntityIds(
    s0,
    e => e.owner == testp1Id && e.fixture == fixtureNames.base
  )[0];
  const p2base = findEntityIds(
    s0,
    e => e.owner == testp2Id && e.fixture == fixtureNames.base
  )[0];
  expect(() =>
    CodexGame.checkAction(s0, {
      type: "attack",
      attacker: p1base,
      target: p2base
    })
  ).toThrow();
  const s1 = playActions(s0, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(() =>
    CodexGame.checkAction(s1, {
      type: "attack",
      attacker: p1base,
      target: p2base
    })
  ).toThrow();
});

test("Attacking 1/2s with other 1/2s", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "tenderfoot");
  putCardInHand(s0, testp1Id, "tenderfoot");
  putCardInHand(s0, testp2Id, "tenderfoot");
  const s1 = playActions(s0, [
    { type: "play", card: "tenderfoot" },
    { type: "play", card: "tenderfoot" },
    { type: "endTurn" },
    { type: "play", card: "tenderfoot" },
    { type: "endTurn" }
  ]);
  const attackerIds = findEntityIds(
    s1,
    u => u.owner == testp1Id && u.card == "tenderfoot"
  );
  expect(attackerIds).toHaveLength(2);
  const targetIds = findEntityIds(
    s1,
    u => u.owner == testp2Id && u.card == "tenderfoot"
  );
  expect(targetIds).toHaveLength(1);
  const oldDiscardSize = s1.players[testp2Id].discard.length;
  const s2 = playActions(s1, [
    { type: "attack", attacker: attackerIds[0], target: targetIds[0] }
  ]);
  expect(s2.entities[attackerIds[0]].damage).toEqual(1);
  expect(s2.entities[targetIds[0]].damage).toEqual(1);
  expect(s2.players[testp2Id].discard.length).toEqual(oldDiscardSize);
  const s3 = playActions(s2, [
    { type: "attack", attacker: attackerIds[1], target: targetIds[0] }
  ]);
  expect(s3.entities[attackerIds[1]].damage).toEqual(1);
  expect(s3.entities[targetIds[0]]).toBeUndefined();
  expect(s3.players[testp2Id].discard.length).toEqual(oldDiscardSize + 1);
});
