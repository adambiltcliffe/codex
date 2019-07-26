import { targetMode } from "../cardinfo/constants";
import { currentTriggerDefinition } from "../triggers";
import { getCurrentValues } from "../entities";
import { sumKeyword, resist } from "../cardinfo/keywords";
import { getAP } from "../util";

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
  if (!stepDef.targetTypes.includes(chosenTargetVals.type)) {
    throw new Error("Target entity is the wrong type");
  }
  const resistCost = sumKeyword(chosenTargetVals, resist);
  if (resistCost > getAP(state).gold) {
    throw new Error("Not enough gold to pay for resist");
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
    const resistCost = sumKeyword(chosenTargetVals, resist);
    getAP(state).gold -= resistCost;
  }
}
