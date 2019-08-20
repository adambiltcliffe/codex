import { getAP } from "./util";
import log from "./log";
import { applyStateBasedEffects } from "./entities";
import { getLegalChoicesForStep } from "./targets";

import cardInfo, { targetMode } from "./cardinfo";
import triggerInfo from "./triggerinfo";
import effectInfo from "./effectinfo";

import get from "lodash/get";

export const triggerDefinitions = {
  cardInfo,
  triggerInfo,
  effectInfo
};

export function addSpellToQueue(state, trigger) {
  state.queue.push(trigger);
}

export function addTriggerToQueue(state, trigger) {
  state.queue.push(trigger);
  if (!trigger.isActivatedAbility) {
    const desc =
      "Triggered action" +
      (trigger.sourceId
        ? ` from ${state.entities[trigger.sourceId].current.name}`
        : "");
    log.add(state, `${desc} was added to the queue.`);
  }
}

export function enqueueNextTrigger(state) {
  state.currentTrigger = state.queue.shift();
  const def = currentTriggerDefinition(state);
  if (def.steps) {
    state.currentTrigger.stepIndex = 0;
    state.currentTrigger.choices = def.steps.map(_ => ({}));
  } else {
    state.currentTrigger.choices = {};
  }
}

export function currentTriggerDefinition(state) {
  return get(triggerDefinitions, state.currentTrigger.path);
}

export function getLegalChoicesForCurrentTrigger(state) {
  const def = currentTriggerDefinition(state);
  let stepDef = def;
  if (def.steps) {
    stepDef = def.steps[state.currentTrigger.stepIndex];
  }
  return getLegalChoicesForStep(state, stepDef);
}

export function canResolveCurrentTrigger(state) {
  const def = currentTriggerDefinition(state);
  let stepDef = def;
  let choices = state.currentTrigger.choices;
  if (def.steps) {
    stepDef = def.steps[state.currentTrigger.stepIndex];
    choices = state.currentTrigger.choices[state.currentTrigger.stepIndex];
  }
  // special cases for where no choice is needed
  if (stepDef.targetMode == undefined) {
    return true;
  }
  if (
    stepDef.shouldSkipChoice !== undefined &&
    stepDef.shouldSkipChoice(state)
  ) {
    return true;
  }
  switch (stepDef.targetMode) {
    case targetMode.single:
      if (choices.targetId !== undefined) {
        return true;
      }
      const possibleChoices = getLegalChoicesForStep(state, stepDef);
      switch (possibleChoices.length) {
        case 0:
          log.add(state, `${stepDef.prompt}: No legal choices.`);
          choices.skipped = true;
          return true;
        case 1:
          log.add(state, `${stepDef.prompt}: Only one legal choice.`);
          choices.targetId = possibleChoices[0];
          return true;
        default:
          return false;
      }
    case targetMode.obliterate:
      if (choices.targetIds !== undefined) {
        return true;
      }
      const dpId = state.currentAttack.defendingPlayer;
      const [definitely, maybe] = getObliterateTargets(
        state,
        dpId,
        stepDef.targetCount
      );
      return maybe.length == 0;
  }
}

export function resolveCurrentTrigger(state) {
  const def = currentTriggerDefinition(state);
  let isMultiStepTrigger = false;
  let action = def.action;
  let choices = state.currentTrigger.choices;
  if (def.steps) {
    isMultiStepTrigger = true;
    action = def.steps[state.currentTrigger.stepIndex].action;
    choices = choices[state.currentTrigger.stepIndex];
  }
  if (!choices.skipped) {
    action({
      state,
      source: state.entities[state.currentTrigger.sourceId],
      choices
    });
  }
  if (
    isMultiStepTrigger &&
    state.currentTrigger.stepIndex < def.steps.length - 1
  ) {
    state.currentTrigger.stepIndex++;
  } else {
    if (state.currentTrigger.isSpell) {
      state.updateHidden(fs => {
        getAP(fs).discard.push(fs.playedCard);
        delete fs.playedCard;
      });
    }
    state.currentTrigger = null;
  }
  applyStateBasedEffects(state);
}
