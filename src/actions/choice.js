import { currentTriggerDefinition } from "../triggers";
import { getAP, andJoin } from "../util";
import { getResistCost, getLegalChoicesForStep } from "../targets";
import log from "../log";
import { targetMode } from "../cardinfo";
import { getObliterateTargets } from "../cardinfo/abilities/obliterate";

import some from "lodash/some";

export function checkChoiceAction(state, action) {
  if (state.currentTrigger === null) {
    throw new Error("Can't make choices when a trigger isn't resolving");
  }
  let stepDef = currentTriggerDefinition(state);
  if (stepDef.steps) {
    stepDef = stepDef.steps[state.currentTrigger.stepIndex];
  }
  switch (stepDef.targetMode) {
    case targetMode.single:
      const legalChoices = getLegalChoicesForStep(state, stepDef);
      if (!legalChoices.includes(action.target)) {
        throw new Error(
          `Not a legal choice, legal choices are ${andJoin(legalChoices)}`
        );
      }
      return true;
    case targetMode.obliterate:
      const dpId = state.currentAttack.defendingPlayer;
      const [definitely, maybe] = getObliterateTargets(
        state,
        dpId,
        stepDef.targetCount
      );
      const choicesNeeded = stepDef.targetCount - definitely.length;
      if (action.targets.length != choicesNeeded) {
        throw new Error("Wrong number of units to obliterate");
      }
      action.targets.forEach(id => {
        if (!some(maybe, e => e.id == id)) {
          throw new Error(
            `${id} is not among valid choices: ${andJoin(maybe.map(e => e.id))}`
          );
        }
      });
      return true;
  }
}

export function doChoiceAction(state, action) {
  const def = currentTriggerDefinition(state);
  let choices = state.currentTrigger.choices;
  let stepDef = def;
  if (def.steps) {
    choices = choices[state.currentTrigger.stepIndex];
    stepDef = def.steps[state.currentTrigger.stepIndex];
  }
  /* const prompt = def.steps
    ? def.steps[state.currentTrigger.stepIndex].prompt
    : def.prompt; */
  switch (stepDef.targetMode) {
    case targetMode.single:
      choices.targetId = action.target;
      const target = state.entities[action.target];
      if (
        stepDef.hasTargetSymbol &&
        target.current.controller != getAP(state).id
      ) {
        const resistCost = getResistCost(state, target);
        getAP(state).gold -= resistCost;
      }
      log.add(state, log.fmt`${getAP(state)} chooses ${target.current.name}.`);
    case targetMode.obliterate:
      choices.targetIds = action.targets;
  }
}
