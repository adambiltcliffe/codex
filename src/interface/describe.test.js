import {
  describePhase,
  describePatrolSlot,
  describeFixture,
  describeQueueItem,
  describeEntityAbility
} from "./describe";
import { phases } from "../phases";
import { patrolSlots } from "../patrolzone";
import { fixtureNames } from "../fixtures";

import { TestGame, testp1Id, testp2Id } from "../testutil";

import findIndex from "lodash/findIndex";

test("Describing phases", () => {
  expect(describePhase(phases.ready)).toEqual("ready phase");
});

test("Describing patrol slots", () => {
  expect(describePatrolSlot(patrolSlots.squadLeader)).toEqual("Squad Leader");
});

test("Describing fixtures", () => {
  expect(describeFixture(fixtureNames.base)).toEqual("base");
  expect(describeFixture(fixtureNames.tech1)).toEqual("tech I building");
});

test("Describing abilities", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, ["merfolk_prospector", "maestro", "tenderfoot"]);
  const [mp, ma, tf] = tg.insertedEntityIds;
  expect(describeEntityAbility(tg.state.entities[mp], 0)).toEqual(
    "⤵ → Gain ①."
  );
  const index = findIndex(
    tg.state.entities[tf].current.abilities,
    a => a.path == "cardInfo.maestro.conferredAbility"
  );
  expect(index).not.toEqual(-1);
  expect(describeEntityAbility(tg.state.entities[tf], index)).toEqual(
    "⤵ → Deal 2 damage to a building. ◎"
  );
});

test("Describing spells in the queue", () => {
  const tg = new TestGame();
  tg.insertEntity(testp1Id, "troq_bashar");
  tg.putCardsInHand(testp1Id, ["wrecking_ball"]);
  tg.playAction({ type: "play", card: "wrecking_ball" });
  expect(describeQueueItem(tg.state.currentTrigger)).toEqual("Wrecking Ball");
});

test("Describing triggered actions in the queue", () => {
  const tg = new TestGame();
  tg.putCardsInHand(testp1Id, ["brick_thief"]);
  tg.playAction({ type: "play", card: "brick_thief" });
  expect(describeQueueItem(tg.state.currentTrigger)).toEqual(
    "Triggered action of Brick Thief (Arrives or attacks: Deal 1 damage to a building and repair 1 damage from another building.)"
  );
});

test("Describing activated abilities in the queue", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, ["maestro", "nimble_fencer"]);
  const [ma, nf] = tg.insertedEntityIds;
  const index = findIndex(
    tg.state.entities[nf].current.abilities,
    a => a.path == "cardInfo.maestro.conferredAbility"
  );
  expect(index).not.toEqual(-1);
  tg.playAction({ type: "activate", source: nf, index });
  expect(describeQueueItem(tg.state.currentTrigger)).toEqual(
    "Ability of Nimble Fencer (⤵ → Deal 2 damage to a building. ◎)"
  );
});

test("Describing new triggers that have not been queued yet", () => {
  const tg = new TestGame();
  tg.insertEntities(testp2Id, ["helpful_turtle", "starcrossed_starlet"]);
  tg.playAction({ type: "endTurn" });
  expect(tg.state.newTriggers).toHaveLength(2);
  expect(describeQueueItem(tg.state.newTriggers[0])).toEqual(
    "Triggered action of Helpful Turtle (Healing 1)"
  );
  expect(describeQueueItem(tg.state.newTriggers[1])).toEqual(
    "Triggered action of Star-Crossed Starlet (Upkeep: This takes 1 damage.)"
  );
});
