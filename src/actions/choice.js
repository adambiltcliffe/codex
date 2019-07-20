import { targetMode } from "../cardinfo/constants";
import { currentTriggerDefinition } from "../triggers";
import { getCurrentValues } from "../entities";
import { sumKeyword, resist } from "../cardinfo/keywords";
import { getAP } from "../util";

export function checkChoiceAction(state, action) {
  if (state.currentTrigger === undefined) {
    throw new Error("Can't make choices when a trigger isn't resolving");
  }
  if (currentTriggerDefinition(state).targetMode != targetMode.single) {
    throw new Error("Can't choose a target for a trigger without a target");
  }
  const chosenTarget = state.entities[action.target];
  if (typeof chosenTarget != "object") {
    throw new Error("Invalid target ID");
  }
  const chosenTargetVals = getCurrentValues(state, action.target);
  if (
    !currentTriggerDefinition(state).targetTypes.includes(chosenTargetVals.type)
  ) {
    throw new Error("Target entity is the wrong type");
  }
  const resistCost = sumKeyword(chosenTargetVals, resist);
  if (resistCost > getAP(state).gold) {
    throw new Error("Not enough gold to pay for resist");
  }
  return true;
}

export function doChoiceAction(state, action) {
  state.currentTrigger.choices.targetId = action.target;
  const chosenTargetVals = getCurrentValues(state, action.target);
  const resistCost = sumKeyword(chosenTargetVals, resist);
  getAP(state).gold -= resistCost;
}
