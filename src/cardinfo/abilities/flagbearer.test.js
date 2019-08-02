import {
  withCardsInHand,
  withInsertedEntity,
  getTestGame,
  testp1Id,
  withInsertedEntities,
  testp2Id,
  playActions,
  findEntityIds,
  withGoldSetTo
} from "../../testutil";
import CodexGame from "../../codex";
import { fixtureNames } from "../../fixtures";

test("Spells must target flagbearer", () => {
  const [s0, troq] = withInsertedEntity(
    withCardsInHand(getTestGame(), ["wither"], []),
    testp1Id,
    "troq_bashar"
  );
  const [s1, [gf, ob]] = withInsertedEntities(s0, testp2Id, [
    "granfalloon_flagbearer",
    "older_brother"
  ]);
  const s2 = playActions(s1, [{ type: "play", card: "wither" }]);
  expect(() =>
    CodexGame.checkAction(s2, { type: "choice", target: gf })
  ).not.toThrow();
  expect(() =>
    CodexGame.checkAction(s2, { type: "choice", target: ob })
  ).toThrow();
});

test("Spells can ignore flagbearer if they can't target units", () => {
  const [s0, troq] = withInsertedEntity(
    withCardsInHand(getTestGame(), ["wrecking_ball"], []),
    testp1Id,
    "troq_bashar"
  );
  const p2base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  const [s1, gf] = withInsertedEntity(s0, testp2Id, "granfalloon_flagbearer");
  const s2 = playActions(s1, [{ type: "play", card: "wrecking_ball" }]);
  expect(() =>
    CodexGame.checkAction(s2, { type: "choice", target: gf })
  ).toThrow();
  expect(() =>
    CodexGame.checkAction(s2, { type: "choice", target: p2base })
  ).not.toThrow();
});

test("Spells can ignore flagbearer if can't pay for resist", () => {
  const [s0, troq] = withInsertedEntity(getTestGame(), testp1Id, "troq_bashar");
  const [s1, [gf, ob]] = withInsertedEntities(s0, testp2Id, [
    "granfalloon_flagbearer",
    "older_brother"
  ]);
  const s2 = playActions(s1, [
    { type: "endTurn" },
    { type: "endTurn", patrollers: [null, null, null, null, gf] }
  ]);
  const s3 = playActions(
    withGoldSetTo(withCardsInHand(s2, ["wither"], []), testp1Id, 2),
    [{ type: "play", card: "wither" }]
  );
  expect(() =>
    CodexGame.checkAction(s3, { type: "choice", target: gf })
  ).toThrow();
  expect(() =>
    CodexGame.checkAction(s3, { type: "choice", target: ob })
  ).not.toThrow();
});

test("Spark can ignore flagbearer if not patrolling", () => {
  const [s0, troq] = withInsertedEntity(getTestGame(), testp1Id, "troq_bashar");
  const [s1, [gf, ob]] = withInsertedEntities(s0, testp2Id, [
    "granfalloon_flagbearer",
    "older_brother"
  ]);
  const s2 = playActions(s1, [
    { type: "endTurn" },
    { type: "endTurn", patrollers: [null, null, ob, null, null] }
  ]);
  const s3 = withCardsInHand(s2, ["spark"], []);
  const s4 = playActions(s3, [{ type: "play", card: "spark" }]);
  expect(() =>
    CodexGame.checkAction(s4, { type: "choice", target: gf })
  ).toThrow();
  expect(() =>
    CodexGame.checkAction(s4, { type: "choice", target: ob })
  ).not.toThrow();
});

test("Spark can't ignore flagbearer if patrolling", () => {
  const [s0, troq] = withInsertedEntity(getTestGame(), testp1Id, "troq_bashar");
  const [s1, [gf, ob]] = withInsertedEntities(s0, testp2Id, [
    "granfalloon_flagbearer",
    "older_brother"
  ]);
  const s2 = playActions(s1, [
    { type: "endTurn" },
    { type: "endTurn", patrollers: [null, gf, ob, null, null] }
  ]);
  const s3 = withCardsInHand(s2, ["spark"], []);
  const s4 = playActions(s3, [{ type: "play", card: "spark" }]);
  expect(() =>
    CodexGame.checkAction(s4, { type: "choice", target: gf })
  ).not.toThrow();
  expect(() =>
    CodexGame.checkAction(s4, { type: "choice", target: ob })
  ).toThrow();
});
