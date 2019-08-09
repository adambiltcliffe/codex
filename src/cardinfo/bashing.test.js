import {
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  testp2Id,
  findEntityIds,
  withInsertedEntity,
  TestGame
} from "../testutil";
import { fixtureNames } from "../fixtures";
import { hasKeyword, stealth } from "./abilities/keywords";

test("Hired Stomper must kill itself with own trigger if no other units", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "hired_stomper");
  expect(s0.currentTrigger).toBeNull();
  const s1 = playActions(s0, [{ type: "play", card: "hired_stomper" }]);
  expect(s1.log).toContain("Hired Stomper deals 3 damage to itself.");
});

test("Hired Stomper can kill itself with own trigger even if other options available", () => {
  const s0 = new TestGame()
    .insertEntity(testp1Id, "older_brother")
    .putCardsInHand(testp1Id, ["hired_stomper"]).state;
  expect(s0.currentTrigger).toBeNull();
  const s1 = playActions(s0, [{ type: "play", card: "hired_stomper" }]);
  expect(s1.currentTrigger).not.toBeNull();
  const hs = findEntityIds(s1, e => e.card == "hired_stomper")[0];
  const s2 = playActions(s1, [{ type: "choice", target: hs }]);
  expect(s2.entities[hs]).toBeUndefined();
  expect(s2.log).toContain("Hired Stomper deals 3 damage to itself.");
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

test("The Boot can kill a tech 0 or 1 unit but not tech 2 or 3", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["the_boot"])
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, [
      "older_brother",
      "iron_man",
      "eggship",
      "trojan_duck"
    ]);
  const [troq, ob, im, es, td] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "the_boot" });
  expect(tg.getLegalChoices().sort()).toEqual([ob, im].sort());
  expect(() => tg.playAction({ type: "choice", target: es })).toThrow();
  expect(() => tg.playAction({ type: "choice", target: td })).toThrow();
  const tg1 = new TestGame(tg.state);
  tg1.playAction({ type: "choice", target: ob });
  expect(tg1.state.entities[ob]).toBeUndefined();
  expect(tg1.state.log).toContain("Older Brother dies.");
  const tg2 = new TestGame(tg.state);
  tg2.playAction({ type: "choice", target: im });
  expect(tg2.state.entities[im]).toBeUndefined();
  expect(tg2.state.log).toContain("Iron Man dies.");
});

test("Intimidate decreases attack by 4 for a turn", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, ["older_brother", "regularsized_rhinoceros"])
    .putCardsInHand(testp1Id, ["intimidate", "intimidate"]);
  const [troq, ob, rr] = tg.insertedEntityIds;
  tg.playActions([
    { type: "play", card: "intimidate" },
    { type: "choice", target: ob },
    { type: "play", card: "intimidate" },
    { type: "choice", target: rr }
  ]);
  expect(tg.state.entities[ob].current.attack).toEqual(0);
  expect(tg.state.entities[rr].current.attack).toEqual(1);
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[ob].current.attack).toEqual(2);
  expect(tg.state.entities[rr].current.attack).toEqual(5);
});

test("Sneaky Pig has stealth on first turn but not later", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .putCardsInHand(testp2Id, ["sneaky_pig"]);
  const [im] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [im, null, null, null, null] },
    { type: "play", card: "sneaky_pig" }
  ]);
  const sp = findEntityIds(tg.state, e => e.card == "sneaky_pig")[0];
  const p1base = tg.findBaseId(testp1Id);
  expect(tg.state.entities[sp].effects.length).toEqual(1);
  expect(hasKeyword(tg.state.entities[sp].current, stealth)).toBeTruthy();
  expect(() =>
    tg.checkAction({ type: "attack", attacker: sp, target: p1base })
  ).not.toThrow();
  tg.playActions([
    { type: "endTurn" },
    { type: "endTurn", patrollers: [im, null, null, null, null] }
  ]);
  expect(tg.state.entities[sp].effects.length).toEqual(0);
  expect(hasKeyword(tg.state.entities[sp].current, stealth)).toBeFalsy();
  expect(() =>
    tg.checkAction({ type: "attack", attacker: sp, target: p1base })
  ).toThrow();
});
