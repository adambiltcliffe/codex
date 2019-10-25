import { phases } from "../phases";
import { patrolSlotNames } from "../patrolzone";
import fixtures from "../fixtures";

const phaseNames = {
  [phases.tech]: "tech phase",
  [phases.ready]: "ready phase",
  [phases.upkeep]: "upkeep",
  [phases.main]: "main phase",
  [phases.draw]: "discard/draw phase"
};

export const describePhase = phase => phaseNames[phase] || "unknown phase";

export const describePatrolSlot = index =>
  patrolSlotNames[index] || "unknown patrol slot";

export const describeFixture = fixture =>
  fixtures[fixture].name || "unknown fixture";
