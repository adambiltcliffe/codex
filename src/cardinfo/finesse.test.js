import {
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  findEntityIds,
  testp2Id,
  getGameWithUnits,
  withInsertedEntity,
  getTestGame,
  withInsertedEntities,
  withGoldSetTo,
  withCardsInHand
} from "../testutil";
import { getCurrentValues } from "../entities";
import { fixtureNames } from "../fixtures";
import CodexGame from "../codex";
import { hasKeyword, haste } from "./abilities/keywords";

test("Nimble Fencer gives herself and other Virtuosos haste", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "tenderfoot");
  putCardInHand(s0, testp1Id, "nimble_fencer");
  const s1 = playActions(s0, [{ type: "play", card: "tenderfoot" }]);
  const tf = findEntityIds(s1, e => e.card == "tenderfoot")[0];
  const p2base = findEntityIds(
    s1,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  expect(hasKeyword(getCurrentValues(s1, tf), haste)).toBeFalsy();
  expect(() =>
    CodexGame.checkAction(s1, { type: "attack", attacker: tf, target: p2base })
  ).toThrow();
  const s2 = playActions(s1, [{ type: "play", card: "nimble_fencer" }]);
  expect(hasKeyword(getCurrentValues(s2, tf), haste)).toBeTruthy();
  expect(() =>
    CodexGame.checkAction(s2, { type: "attack", attacker: tf, target: p2base })
  ).not.toThrow();
  const nf = findEntityIds(s2, e => e.card == "nimble_fencer")[0];
  expect(hasKeyword(getCurrentValues(s2, nf), haste)).toBeTruthy();
  expect(() =>
    CodexGame.checkAction(s2, { type: "attack", attacker: nf, target: p2base })
  ).not.toThrow();
});

test("Star-Crossed Starlet buffs her attack with damage and kills herself after 2 turns", () => {
  const s0 = getNewGame();
  const [s1, scs] = withInsertedEntity(s0, testp1Id, "starcrossed_starlet");
  expect(s1.entities[scs].damage).toEqual(0);
  expect(getCurrentValues(s1, scs).attack).toEqual(3);
  const s2 = playActions(s1, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(s2.entities[scs].damage).toEqual(1);
  expect(getCurrentValues(s2, scs).attack).toEqual(4);
  expect(s2.log).toContain("Star-Crossed Starlet takes 1 damage.");
  const s3 = playActions(s2, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(s3.entities[scs]).toBeUndefined();
  expect(s3.log).toContain("Star-Crossed Starlet dies.");
});

test("Grounded Guide buffs Virtuosos and non-Virtuosos by appropriate amounts", () => {
  const s0 = getNewGame();
  s0.players[testp1Id].gold = 20;
  putCardInHand(s0, testp1Id, "tenderfoot");
  putCardInHand(s0, testp1Id, "older_brother");
  putCardInHand(s0, testp1Id, "grounded_guide");
  putCardInHand(s0, testp1Id, "grounded_guide");
  const s1 = playActions(s0, [
    { type: "play", card: "tenderfoot" },
    { type: "play", card: "older_brother" }
  ]);
  const tf = findEntityIds(s1, u => u.card == "tenderfoot")[0];
  const ob = findEntityIds(s1, u => u.card == "older_brother")[0];
  expect(getCurrentValues(s1, tf).attack).toEqual(1);
  expect(getCurrentValues(s1, ob).attack).toEqual(2);
  expect(getCurrentValues(s1, tf).hp).toEqual(2);
  expect(getCurrentValues(s1, ob).hp).toEqual(2);
  const s2 = playActions(s1, [{ type: "play", card: "grounded_guide" }]);
  expect(getCurrentValues(s2, tf).attack).toEqual(3);
  expect(getCurrentValues(s2, ob).attack).toEqual(3);
  expect(getCurrentValues(s2, tf).hp).toEqual(3);
  expect(getCurrentValues(s2, ob).hp).toEqual(2);
  const gg1 = findEntityIds(s2, u => u.card == "grounded_guide")[0];
  expect(getCurrentValues(s2, gg1).attack).toEqual(4);
  expect(getCurrentValues(s2, gg1).hp).toEqual(4);
  const s3 = playActions(s2, [{ type: "play", card: "grounded_guide" }]);
  expect(getCurrentValues(s3, tf).attack).toEqual(5);
  expect(getCurrentValues(s3, ob).attack).toEqual(4);
  expect(getCurrentValues(s3, tf).hp).toEqual(4);
  expect(getCurrentValues(s3, ob).hp).toEqual(2);
  expect(getCurrentValues(s3, gg1).attack).toEqual(5);
  expect(getCurrentValues(s3, gg1).hp).toEqual(4);
});

test("Nimble Fencer and Grounded Guide don't buff opposing units", () => {
  const s0 = getGameWithUnits(
    ["nimble_fencer", "grounded_guide"],
    ["tenderfoot"]
  );
  const tf = findEntityIds(s0, e => e.card == "tenderfoot")[0];
  const tfv = getCurrentValues(s0, tf);
  expect(tfv.attack).toEqual(1);
  expect(tfv.hp).toEqual(2);
  expect(hasKeyword(tfv, haste)).toBeFalsy();
});

test("Maestro confers its activated ability on Virtuosos", () => {
  const [s0, [ma, tf, ob]] = withInsertedEntities(getTestGame(), testp1Id, [
    "maestro",
    "tenderfoot",
    "older_brother"
  ]);
  const p2base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  expect(getCurrentValues(s0, ma).abilities.length).toEqual(1);
  expect(getCurrentValues(s0, tf).abilities.length).toEqual(1);
  expect(getCurrentValues(s0, ob).abilities.length).toEqual(0);
  expect(() =>
    CodexGame.checkAction(s0, { type: "activate", source: tf, index: 0 })
  ).toThrow();
  const s1 = playActions(s0, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(() =>
    CodexGame.checkAction(s1, { type: "activate", source: tf, index: 0 })
  ).not.toThrow();
  const s2 = playActions(s1, [
    { type: "activate", source: tf, index: 0 },
    { type: "choice", target: p2base }
  ]);
  expect(s2.entities[p2base].damage).toEqual(2);
  expect(s2.log).toContain("Tenderfoot deals 2 damage to base.");
});

test("Maestro's conferred ability disappears if it dies", () => {
  const [s0, [im1, im2]] = withInsertedEntities(getTestGame(), testp2Id, [
    "iron_man",
    "iron_man"
  ]);
  const [s1, [ma, tf]] = withInsertedEntities(s0, testp1Id, [
    "maestro",
    "tenderfoot"
  ]);
  const s2 = playActions(s1, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(getCurrentValues(s2, tf).abilities.length).toEqual(1);
  expect(() =>
    CodexGame.checkAction(s2, { type: "activate", source: tf, index: 0 })
  ).not.toThrow();
  const s3 = playActions(s2, [
    { type: "endTurn" },
    { type: "attack", attacker: im1, target: ma },
    { type: "attack", attacker: im2, target: ma },
    { type: "endTurn" }
  ]);
  expect(s3.entities[ma]).toBeUndefined();
  expect(getCurrentValues(s3, tf).abilities.length).toEqual(0);
  expect(() =>
    CodexGame.checkAction(s3, { type: "activate", source: tf, index: 0 })
  ).toThrow();
});

test("Maestro reduces cost to cast Virtuosos to 0", () => {
  const s0 = withGoldSetTo(
    withCardsInHand(getTestGame(), ["tenderfoot"], []),
    testp1Id,
    0
  );
  expect(() =>
    CodexGame.checkAction(s0, { type: "play", card: "tenderfoot" })
  ).toThrow();
  const [s1, ma] = withInsertedEntity(s0, testp1Id, "maestro");
  expect(() =>
    CodexGame.checkAction(s1, { type: "play", card: "tenderfoot" })
  ).not.toThrow();
  const s2 = playActions(s1, [{ type: "play", card: "tenderfoot" }]);
  expect(s2.players[testp1Id].gold).toEqual(0);
  const s1a = withGoldSetTo(s1, testp1Id, 10);
  const s2a = playActions(s1a, [{ type: "play", card: "tenderfoot" }]);
  expect(s2a.players[testp1Id].gold).toEqual(10);
});
