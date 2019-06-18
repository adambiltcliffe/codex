import log from "./log";
import cardInfo from "./cardinfo";

export function addTriggerToQueue(state, trigger) {
  state.queue.push(trigger);
  log.add(
    state,
    `Triggered action from ${
      cardInfo[state.entities[trigger.sourceId].card].name
    } was added to the queue.`
  );
}
