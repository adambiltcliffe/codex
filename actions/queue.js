import { addTriggerToQueue } from "../triggers";

export function checkQueueAction(state, action) {
  if (!Number.isInteger(action.index)) {
    throw new Error("Trigger index must be an integer");
  }
  if (action.index < 0 || action.index >= state.newTriggers.length) {
    throw new Error("Illegal trigger index");
  }
  return true;
}

export function doQueueAction(state, action) {
  const trigger = state.newTriggers.splice(action.index, 1)[0];
  addTriggerToQueue(state, trigger);
}
