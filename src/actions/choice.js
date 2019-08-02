import { targetMode } from "../cardinfo/constants";
import { currentTriggerDefinition } from "../triggers";
import { getCurrentValues } from "../entities";
import {
  sumKeyword,
  resist,
  hasKeyword,
  flagbearer,
  invisible
} from "../cardinfo/abilities/keywords";
import { getAP } from "../util";
import { patrolSlots } from "../patrolzone";

function getResistCost(state, entityId, entityVals) {
  const bonusResist =
    state.players[entityVals.controller].patrollerIds[patrolSlots.lookout] ==
    entityId
      ? 1
      : 0;
  return sumKeyword(entityVals, resist) + bonusResist;
}

export function stepCanTarget(state, stepDef, targetId, targetVals) {
  if (!stepDef.targetTypes.includes(targetVals.type)) {
    return false;
  }
  if (
    stepDef.canTarget &&
    !stepDef.canTarget({
      state,
      triggerInfo: state.currentTrigger,
      targetId,
      targetVals
    })
  ) {
    return false;
  }
  return true;
}

export function checkChoiceAction(state, action) {
  if (state.currentTrigger === null) {
    throw new Error("Can't make choices when a trigger isn't resolving");
  }
  let stepDef = currentTriggerDefinition(state);
  if (stepDef.steps) {
    stepDef = stepDef.steps[state.currentTrigger.stepIndex];
  }
  if (stepDef.targetMode != targetMode.single) {
    throw new Error("Can't choose a target for a trigger without a target");
  }
  const chosenTarget = state.entities[action.target];
  if (typeof chosenTarget != "object") {
    throw new Error("Invalid target ID");
  }
  const chosenTargetVals = getCurrentValues(state, action.target);
  if (!stepCanTarget(state, stepDef, action.target, chosenTargetVals)) {
    throw new Error("Not a legal target for that ability");
  }
  if (chosenTargetVals.controller != getAP(state).id) {
    if (hasKeyword(chosenTargetVals, invisible)) {
      throw new Error("Target is invisible");
    }
    const resistCost = getResistCost(state, action.target, chosenTargetVals);
    if (resistCost > getAP(state).gold) {
      throw new Error("Not enough gold to pay for resist");
    }
  }
  if (!hasKeyword(chosenTargetVals, flagbearer)) {
    const allValues = getCurrentValues(state, Object.keys(state.entities));
    Object.values(allValues).forEach(v => {
      if (hasKeyword(v, flagbearer) && v.id != action.target) {
        throw new Error("Must choose a flagbearer if able");
      }
    });
  }
  return true;
}

export function doChoiceAction(state, action) {
  const def = currentTriggerDefinition(state);
  const choices = def.steps
    ? state.currentTrigger.choices[state.currentTrigger.stepIndex]
    : state.currentTrigger.choices;
  choices.targetId = action.target;
  const chosenTargetVals = getCurrentValues(state, action.target);
  if (chosenTargetVals.controller != getAP(state).id) {
    const resistCost = getResistCost(state, action.target, chosenTargetVals);
    getAP(state).gold -= resistCost;
  }
}
