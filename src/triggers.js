import log from "./log";
import cardInfo from "./cardinfo";
import { targetMode } from "./cardinfo/constants";
import { getName } from "./entities";

export function addTriggerToQueue(state, trigger) {
  state.queue.push(trigger);
  log.add(
    state,
    `Triggered action from ${getName(
      state,
      trigger.sourceId
    )} was added to the queue.`
  );
}

export function currentTriggerDefinition(state) {
  return cardInfo[state.currentTrigger.card].abilities[
    state.currentTrigger.index
  ];
}

export function canResolveCurrentTrigger(state) {
  switch (currentTriggerDefinition(state).targetMode) {
    case undefined:
      return true;
    case targetMode.single:
      // need to cover the case where there is no valid target
      return state.currentTrigger.choices.targetId !== undefined;
  }
}
