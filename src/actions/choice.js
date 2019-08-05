import { currentTriggerDefinition } from "../triggers";
import { getAP, andJoin } from "../util";
import { getResistCost, getLegalChoicesForStep } from "../targets";

export function checkChoiceAction(state, action) {
  if (state.currentTrigger === null) {
    throw new Error("Can't make choices when a trigger isn't resolving");
  }
  let stepDef = currentTriggerDefinition(state);
  if (stepDef.steps) {
    stepDef = stepDef.steps[state.currentTrigger.stepIndex];
  }
  const legalChoices = getLegalChoicesForStep(state, stepDef);
  if (!legalChoices.includes(action.target)) {
    throw new Error(
      `Not a legal choice, legal choices are ${andJoin(legalChoices)}`
    );
  }
  return true;
}

export function doChoiceAction(state, action) {
  const def = currentTriggerDefinition(state);
  const choices = def.steps
    ? state.currentTrigger.choices[state.currentTrigger.stepIndex]
    : state.currentTrigger.choices;
  choices.targetId = action.target;
  const target = state.entities[action.target];
  if (target.current.controller != getAP(state).id) {
    const resistCost = getResistCost(state, target);
    getAP(state).gold -= resistCost;
  }
}
