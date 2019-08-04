import {
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  testp2Id,
  findEntityIds,
  withInsertedEntity
} from "../testutil";
import { fixtureNames } from "../fixtures";

test("Hired Stomper can kill itself with own trigger", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "hired_stomper");
  expect(s0.currentTrigger).toBeNull();
  const s1 = playActions(s0, [{ type: "play", card: "hired_stomper" }]);
  expect(s1.currentTrigger).not.toBeNull();
  const hs = findEntityIds(s1, e => e.card == "hired_stomper")[0];
  const s2 = playActions(s1, [{ type: "choice", target: hs }]);
  expect(s2.entities[hs]).toBeUndefined();
  expect(s2.log).toContain("Hired Stomper deals 3 damage to Hired Stomper.");
});

test("Hired Stomper can target your own units or the opponent's", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "regularsized_rhinoceros");
  putCardInHand(s0, testp2Id, "regularsized_rhinoceros");
  putCardInHand(s0, testp2Id, "hired_stomper");
  putCardInHand(s0, testp2Id, "hired_stomper");
  s0.players[testp2Id].gold = 20;
  const s1 = playActions(s0, [
    { type: "play", card: "regularsized_rhinoceros" },
    { type: "endTurn" },
    { type: "play", card: "regularsized_rhinoceros" }
  ]);
  const p1rhino = findEntityIds(
    s1,
    e => e.card == "regularsized_rhinoceros" && e.owner == testp1Id
  )[0];
  const p2rhino = findEntityIds(
    s1,
    e => e.card == "regularsized_rhinoceros" && e.owner == testp2Id
  )[0];
  const s2 = playActions(s1, [
    { type: "play", card: "hired_stomper" },
    { type: "choice", target: p1rhino },
    { type: "play", card: "hired_stomper" },
    { type: "choice", target: p2rhino }
  ]);
  expect(s2.entities[p1rhino].damage).toEqual(3);
  expect(s2.entities[p2rhino].damage).toEqual(3);
});

test("Wrecking Ball can deal damage to base", () => {
  const [s0, troq] = withInsertedEntity(getNewGame(), testp1Id, "troq_bashar");
  putCardInHand(s0, testp1Id, "wrecking_ball");
  const p2base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  const s1 = playActions(s0, [{ type: "play", card: "wrecking_ball" }]);
  const s2 = playActions(s1, [{ type: "choice", target: p2base }]);
  expect(s2.entities[p2base].damage).toEqual(2);
  expect(s2.log).toContain("Wrecking Ball deals 2 damage to base.");
});
