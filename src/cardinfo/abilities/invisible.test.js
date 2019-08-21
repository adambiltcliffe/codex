import {
  playActions,
  testp1Id,
  testp2Id,
  findEntityIds,
  getGameWithUnits,
  withCardsInHand,
  withInsertedEntity
} from "../../testutil";
import { getCurrentValues } from "../../entities";
import { fixtureNames } from "../../fixtures";
import { getAttackableEntityIds } from "../../actions/attack";
import CodexGame from "../../codex";

test("Invisible unit can sneak past patrollers", () => {
  const s0 = getGameWithUnits(["iron_man", "iron_man"], ["backstabber"]);
  const [im1, im2] = findEntityIds(s0, e => e.card == "iron_man");
  const bs = findEntityIds(s0, e => e.card == "backstabber")[0];
  const p1base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const s1 = playActions(s0, [
    { type: "endTurn", patrollers: [im1, im2, null, null, null] }
  ]);
  expect(getAttackableEntityIds(s1, s1.entities[bs]).sort()).toEqual(
    [im1, im2, p1base].sort()
  );
});

test("Invisible unit can't be attacked", () => {
  const s0 = getGameWithUnits(["tenderfoot"], ["backstabber"]);
  const tf = findEntityIds(s0, e => e.card == "tenderfoot")[0];
  const bs = findEntityIds(s0, e => e.card == "backstabber")[0];
  expect(() =>
    CodexGame.checkAction(s0, { type: "attack", attacker: tf, target: bs })
  ).toThrow();
});

test("Invisible patroller can be attacked and prevents attacking past", () => {
  const s0 = getGameWithUnits(
    ["backstabber", "backstabber", "iron_man"],
    ["older_brother"]
  );
  const ob = findEntityIds(s0, e => e.card == "older_brother")[0];
  const [bs1, bs2] = findEntityIds(s0, e => e.card == "backstabber");
  const im = findEntityIds(s0, e => e.card == "iron_man")[0];
  const s1 = playActions(s0, [
    {
      type: "endTurn",
      patrollers: [null, null, bs1, null, null]
    }
  ]);
  expect(() =>
    CodexGame.checkAction(s1, { type: "attack", attacker: ob, target: bs1 })
  ).not.toThrow();
  expect(() =>
    CodexGame.checkAction(s1, { type: "attack", attacker: ob, target: bs2 })
  ).toThrow();
  expect(() =>
    CodexGame.checkAction(s1, { type: "attack", attacker: ob, target: im })
  ).toThrow();
});

test("Can target your own invisible units but not the opponent's", () => {
  const [s0, troq] = withInsertedEntity(
    withCardsInHand(
      getGameWithUnits(["backstabber"], ["backstabber"]),
      ["wither"],
      []
    ),
    testp1Id,
    "troq_bashar"
  );
  const p1bs = findEntityIds(
    s0,
    e => e.card == "backstabber" && e.owner == testp1Id
  )[0];
  const p2bs = findEntityIds(
    s0,
    e => e.card == "backstabber" && e.owner == testp2Id
  )[0];
  const s1 = playActions(s0, [{ type: "play", card: "wither" }]);
  expect(() => {
    CodexGame.checkAction(s1, { type: "choice", target: p1bs });
  }).not.toThrow();
  expect(() => {
    CodexGame.checkAction(s1, { type: "choice", target: p2bs });
  }).toThrow();
});
