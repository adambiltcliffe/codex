import {
  getGameWithUnits,
  playActions,
  findEntityIds,
  testp1Id,
  testp2Id
} from "../testutil";
import { getAttackableEntityIds } from "../actions/attack";
import { getCurrentValues } from "../entities";
import { fixtureNames } from "../fixtures";
import { getAP } from "../util";

test("Anti-air unit can attack patrolling flyers or ignore them", () => {
  const s0 = getGameWithUnits(
    ["cloud_sprite", "cloud_sprite", "cloud_sprite"],
    ["fox_primus"]
  );
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const [cs1, cs2, cs3] = findEntityIds(s0, e => e.card == "cloud_sprite");
  const fp = findEntityIds(s0, e => e.card == "fox_primus")[0];
  const s1 = playActions(s0, [
    { type: "endTurn", patrollers: [cs1, cs2, null, null, null] }
  ]);
  const fpv = getCurrentValues(s1, fp);
  expect(getAttackableEntityIds(s1, fpv).sort()).toEqual(
    [p1base, cs1, cs2, cs3].sort()
  );
});

test("Anti-air unit can attack past flying squad leader but not non-flying squad leader", () => {
  const s0 = getGameWithUnits(["cloud_sprite", "iron_man"], ["fox_primus"]);
  const cs = findEntityIds(s0, e => e.card == "cloud_sprite")[0];
  const im = findEntityIds(s0, e => e.card == "iron_man")[0];
  const fp = findEntityIds(s0, e => e.card == "fox_primus")[0];
  const s1a = playActions(s0, [
    { type: "endTurn", patrollers: [cs, im, null, null, null] }
  ]);
  const fpva = getCurrentValues(s1a, fp);
  expect(getAttackableEntityIds(s1a, fpva).sort()).toEqual([cs, im].sort());
  const s1b = playActions(s0, [
    { type: "endTurn", patrollers: [im, cs, null, null, null] }
  ]);
  const fpvb = getCurrentValues(s1b, fp);
  expect(getAttackableEntityIds(s1b, fpvb)).toEqual([im]);
});

test("Anti-air unit deals damage to flyers when attacking them", () => {
  const s0 = getGameWithUnits(["fox_primus"], ["spectral_roc"]);
  const fp = findEntityIds(s0, e => e.card == "fox_primus")[0];
  const sr = findEntityIds(s0, e => e.card == "spectral_roc")[0];
  const s1 = playActions(s0, [{ type: "attack", attacker: fp, target: sr }]);
  expect(s1.entities[sr].damage).toEqual(3);
});

test("Anti-air unit deals damage back to flyers when attacked", () => {
  const s0 = getGameWithUnits(["spectral_roc"], ["fox_primus"]);
  const sr = findEntityIds(s0, e => e.card == "spectral_roc")[0];
  const fp = findEntityIds(s0, e => e.card == "fox_primus")[0];
  const s1 = playActions(s0, [{ type: "attack", attacker: sr, target: fp }]);
  expect(s1.entities[sr].damage).toEqual(2);
});

test("Flyer takes damage when flying over patrollers with anti-air", () => {
  const s0 = getGameWithUnits(["fox_primus", "fox_primus"], ["spectral_roc"]);
  const [fp1, fp2] = findEntityIds(s0, e => e.card == "fox_primus");
  const sr = findEntityIds(s0, e => e.card == "spectral_roc")[0];
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const s1 = playActions(s0, [
    { type: "endTurn", patrollers: [fp1, null, fp2, null, null] },
    { type: "attack", attacker: sr, target: p1base }
  ]);
  expect(s1.entities[sr].damage).toEqual(4);
  expect(s1.log).toContain(
    `\${${testp2Id}} attacks base with Spectral Roc, flying over Fox Primus and Fox Primus.`
  );
});

test("Flyer takes damage when flying over anti-air squad leader to attack another patroller", () => {
  const s0 = getGameWithUnits(
    ["fox_primus", "older_brother"],
    ["spectral_roc"]
  );
  const fp = findEntityIds(s0, e => e.card == "fox_primus")[0];
  const ob = findEntityIds(s0, e => e.card == "older_brother")[0];
  const sr = findEntityIds(s0, e => e.card == "spectral_roc")[0];
  const s1 = playActions(s0, [
    { type: "endTurn", patrollers: [fp, ob, null, null, null] },
    { type: "attack", attacker: sr, target: ob }
  ]);
  expect(s1.entities[sr].damage).toEqual(2);
  expect(s1.log).toContain(
    `\${${testp2Id}} attacks Older Brother with Spectral Roc, flying over Fox Primus.`
  );
});

test("Flyer doesn't take damage when flying over patroller without anti-air", () => {
  const s0 = getGameWithUnits(
    ["older_brother", "older_brother"],
    ["spectral_roc"]
  );
  const [ob1, ob2] = findEntityIds(s0, e => e.card == "older_brother");
  const sr = findEntityIds(s0, e => e.card == "spectral_roc")[0];
  const s1 = playActions(s0, [
    { type: "endTurn", patrollers: [ob1, ob2, null, null, null] },
    { type: "attack", attacker: sr, target: ob2 }
  ]);
  expect(s1.entities[sr].damage).toEqual(0);
  expect(s1.log).toContain(
    `\${${testp2Id}} attacks Older Brother with Spectral Roc.`
  );
});

test("Flyer doesn't take damage from anti-air patroller when attacking another patroller", () => {
  const s0 = getGameWithUnits(["fox_primus", "fox_primus"], ["spectral_roc"]);
  const [fp1, fp2] = findEntityIds(s0, e => e.card == "fox_primus");
  const sr = findEntityIds(s0, e => e.card == "spectral_roc")[0];
  const s1 = playActions(s0, [
    { type: "endTurn", patrollers: [null, fp1, fp2, null, null] },
    { type: "attack", attacker: sr, target: fp2 }
  ]);
  expect(s1.entities[sr].damage).toEqual(2);
  expect(s1.log).toContain(
    `\${${testp2Id}} attacks Fox Primus with Spectral Roc.`
  );
});
