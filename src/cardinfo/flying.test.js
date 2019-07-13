import {
  getGameWithUnits,
  findEntityIds,
  playActions,
  testp1Id
} from "../testutil";
import { fixtureNames } from "../fixtures";
import { getCurrentValues } from "../entities";
import { getAttackableEntityIds } from "../actions/attack";

test("Flying unit attacking non-flying unit takes no damage", () => {
  const s0 = getGameWithUnits(["eggship"], ["regularsized_rhinoceros"]);
  const es = findEntityIds(s0, e => e.card == "eggship")[0];
  const rr = findEntityIds(s0, e => e.card == "regularsized_rhinoceros")[0];
  const s1 = playActions(s0, [{ type: "attack", attacker: es, target: rr }]);
  expect(s1.entities[es].damage).toEqual(0);
  expect(s1.entities[rr].damage).toEqual(4);
});

test("Non-flying unit can't attack flyers even if patrolling, but can get past", () => {
  const s0 = getGameWithUnits(["eggship", "eggship", "eggship"], ["iron_man"]);
  const im = findEntityIds(s0, e => e.card == "iron_man")[0];
  const [es1, es2, es3] = findEntityIds(s0, e => e.card == "eggship");
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const s1 = playActions(s0, [
    {
      type: "endTurn",
      patrollers: [es1, es2, null, null, null]
    }
  ]);
  const imv = getCurrentValues(s1, im);
  expect(getAttackableEntityIds(s1, imv)).toEqual([p1base]);
});

test("Non-flying unit can't attack patrolling flyers but is blocked by ground unit", () => {
  const s0 = getGameWithUnits(
    ["eggship", "eggship", "older_brother"],
    ["iron_man"]
  );
  const im = findEntityIds(s0, e => e.card == "iron_man")[0];
  const [es1, es2] = findEntityIds(s0, e => e.card == "eggship");
  const ob = findEntityIds(s0, e => e.card == "older_brother")[0];
  const s1 = playActions(s0, [
    {
      type: "endTurn",
      patrollers: [es1, es2, ob, null, null]
    }
  ]);
  const imv = getCurrentValues(s1, im);
  expect(getAttackableEntityIds(s1, imv)).toEqual([ob]);
});

test("Flying attacker can attack past non-flying patrollers", () => {
  const s0 = getGameWithUnits(
    ["iron_man", "iron_man", "iron_man"],
    ["eggship"]
  );
  const es = findEntityIds(s0, e => e.card == "eggship")[0];
  const [im1, im2, im3] = findEntityIds(s0, e => e.card == "iron_man");
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const s1 = playActions(s0, [
    {
      type: "endTurn",
      patrollers: [im1, im2, null, null, null]
    }
  ]);
  const esv = getCurrentValues(s1, es);
  expect(getAttackableEntityIds(s1, esv).sort()).toEqual(
    [p1base, im1, im2, im3].sort()
  );
});

test("Flying attacker can attack past non-flying squad leader but not flying patrollers", () => {
  const s0 = getGameWithUnits(["iron_man", "cloud_sprite"], ["eggship"]);
  const es = findEntityIds(s0, e => e.card == "eggship")[0];
  const im = findEntityIds(s0, e => e.card == "iron_man")[0];
  const cs = findEntityIds(s0, e => e.card == "cloud_sprite")[0];
  const s1 = playActions(s0, [
    {
      type: "endTurn",
      patrollers: [im, cs, null, null, null]
    }
  ]);
  const esv = getCurrentValues(s1, es);
  expect(getAttackableEntityIds(s1, esv).sort()).toEqual([im, cs].sort());
});
