import log from "./log";
import cardInfo from "./cardinfo";
import { targetMode } from "./cardinfo/constants";
import { getName } from "./entities";
import { getAP } from "./util";

export function addSpellToQueue(state, trigger) {
  state.queue.push(trigger);
}

export function addTriggerToQueue(state, trigger) {
  state.queue.push(trigger);
  if (!trigger.isActivatedAbility) {
    log.add(
      state,
      `Triggered action from ${getName(
        state,
        trigger.sourceId
      )} was added to the queue.`
    );
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
  return cardInfo[state.currentTrigger.card].abilities[
    state.currentTrigger.index
  ];
}

export function canResolveCurrentTrigger(state) {
  const def = currentTriggerDefinition(state);
  let stepDef = def;
  let choices = state.currentTrigger.choices;
  if (def.steps) {
    stepDef = def.steps[state.currentTrigger.stepIndex];
    choices = state.currentTrigger.choices[state.currentTrigger.stepIndex];
  }
  switch (stepDef.targetMode) {
    case undefined:
      return true;
    case targetMode.single:
      // need to cover the case where there is no valid target
      return choices.targetId !== undefined;
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
  action({
    state,
    source: state.entities[state.currentTrigger.sourceId],
    choices
  });
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
}
