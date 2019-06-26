import { targetMode } from "../cardinfo/constants";
import { currentTriggerDefinition } from "../triggers";
import { getCurrentValues } from "../entities";

export function checkChoiceAction(state, action) {
  if (state.currentTrigger === undefined) {
    throw new Error("Can't make choices when a trigger isn't resolving");
  }
  if (currentTriggerDefinition(state).targetMode != targetMode.single) {
    throw new Error("Can't choose a target for a trigger without a target");
  }
  const chosenTarget = state.entities[action.targetId];
  if (typeof chosenTarget != "object") {
    throw new Error("Invalid target ID");
  }
  const chosenTargetVals = getCurrentValues(state, action.targetId);
  if (
    !currentTriggerDefinition(state).targetTypes.includes(chosenTargetVals.type)
  ) {
    throw new Error("Target entity is the wrong type");
  }
  return true;
}

export function doChoiceAction(state, action) {
  state.currentTrigger.choices.targetId = action.targetId;
}
