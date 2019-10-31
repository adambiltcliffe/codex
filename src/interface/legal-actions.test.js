import { TestGame, testp1Id, testp2Id } from "../testutil";
import {
  canTakeWorkerAction,
  legalAttackActionTree,
  legalActivateActionTree,
  legalPlayActions,
  legalSummonActions,
  legalLevelActionTree,
  legalBuildActions,
  legalPatrollers
} from "./legal-actions";

test("Check if you can worker", () => {
  const tg = new TestGame();
  expect(canTakeWorkerAction(tg.state)).toBeTruthy();
  tg.playAction({ type: "worker", handIndex: 0 });
  expect(canTakeWorkerAction(tg.state)).toBeFalsy();
});

test("Check attack action tree is correct", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, ["older_brother", "backstabber"]);
  tg.insertEntities(testp2Id, ["eggship", "iron_man"]);
  const [ob, bs, es, im] = tg.insertedEntityIds;
  const p2base = tg.findBaseId(testp2Id);
  expect(legalAttackActionTree(tg.state)).toEqual({});
  tg.playActions([
    { type: "endTurn" },
    { type: "endTurn", patrollers: [es, null, im, null, null] }
  ]);
  expect(legalAttackActionTree(tg.state)).toEqual({
    [ob]: [im],
    [bs]: [p2base, im]
  });
});

test("Check activated ability action tree is correct", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, ["tenderfoot", "starcrossed_starlet", "maestro"]);
  const [tf, ss, ma] = tg.insertedEntityIds;
  expect(legalActivateActionTree(tg.state)).toEqual({});
  tg.playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  expect(legalActivateActionTree(tg.state)).toEqual({ [tf]: [0], [ss]: [2] });
});

test("Check legal play actions list is correct", () => {
  const tg = new TestGame();
  tg.putCardsInHand(testp1Id, ["merfolk_prospector", "pirate_gunship"]);
  const acts = legalPlayActions(tg.state);
  expect(acts).toContainEqual({ type: "play", card: "merfolk_prospector" });
  expect(acts).not.toContainEqual({ type: "play", card: "pirate_gunship" });
});

test("Check summon actions list is correct", () => {
  const tg = new TestGame();
  tg.putHeroInCommandZone(testp1Id, "troq_bashar");
  expect(legalSummonActions(tg.state)).toEqual([
    { type: "summon", hero: "troq_bashar" }
  ]);
});

test("Check level up action tree is correct", () => {
  const tg = new TestGame();
  tg.insertEntity(testp1Id, "troq_bashar");
  const [troq] = tg.insertedEntityIds;
  expect(legalLevelActionTree(tg.state)).toEqual({ [troq]: [1, 2, 3, 4] });
  tg.insertEntity(testp1Id, "river_montoya");
  tg.setGold(testp1Id, 2);
  const [_, river] = tg.insertedEntityIds;
  expect(legalLevelActionTree(tg.state)).toEqual({
    [troq]: [1, 2],
    [river]: [1, 2]
  });
});

test("Check legal build actions list", () => {
  const tg = new TestGame();
  expect(legalBuildActions(tg.state)).toEqual([
    { type: "build", fixture: "tower" }
  ]);
  tg.setGold(testp1Id, 6);
  expect(legalBuildActions(tg.state)).toEqual([
    { type: "build", fixture: "surplus" },
    { type: "build", fixture: "tower" }
  ]);
});

test("Check list of legal patrollers", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, [
    "troq_bashar",
    "iron_man",
    "older_brother"
  ]).insertEntities(testp2Id, ["river_montoya", "tenderfoot"]);
  const [troq, im, ob, river, tf] = tg.insertedEntityIds;
  tg.modifyEntity(ob, { ready: false });
  expect(legalPatrollers(tg.state).sort()).toEqual([troq, im].sort());
});
