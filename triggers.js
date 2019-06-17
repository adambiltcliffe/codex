import log from "./log";
import cardInfo from "./cardinfo";

export function addTriggerToQueue(state, trigger) {
  state.queue.push(trigger);
  log.add(
    state,
    `Triggered action from ${
      cardInfo[state.units[trigger.sourceId].card].name
    } was added to the queue.`
  );
}
