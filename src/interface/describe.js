import { phases } from "../phases";
import { patrolSlotNames } from "../patrolzone";
import fixtures from "../fixtures";
import { getAbilityDefinition } from "../entities";
import cardInfo from "../cardinfo";

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

export const describeEntityAbility = (entity, index) =>
  getAbilityDefinition(entity.current.abilities[index]).text;

export const describeQueueItem = trigger => {
  if (trigger.isSpell) {
    return cardInfo[trigger.card].name;
  }
  const text = getAbilityDefinition(trigger).text;
  const prefix = trigger.isActivatedAbility ? "Ability" : "Triggered action";
  const sourceDesc = trigger.sourceName ? ` of ${trigger.sourceName}` : "";
  return `${prefix}${sourceDesc} (${text})`;
};
