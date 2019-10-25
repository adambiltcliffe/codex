import { describePhase, describePatrolSlot, describeFixture } from "./describe";
import { phases } from "../phases";
import { patrolSlots } from "../patrolzone";
import { fixtureNames } from "../fixtures";

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
