import { getCurrentValues } from "../entities";
import { hasKeyword, haste } from "../cardinfo/keywords";
import { getAP } from "../util";

export function checkActivateAction(state, action) {
  const ap = getAP(state);
  if (typeof action.source != "string") {
    throw new Error("Source entity ID must be a string");
  }
  const source = state.entities[action.source];
  if (typeof source != "object") {
    throw new Error("Invalid source entity ID.");
  }
  const sourceVals = getCurrentValues(state, source.id);
  if (sourceVals.controller != ap.id) {
    throw new Error("You don't control the source entity.");
  }
  const abilityDef = sourceVals.abilities[action.index];
  if (typeof abilityDef != "object") {
    throw new Error("Invalid ability index");
  }
  if (!abilityDef.isActivatedAbility) {
    throw new Error("Can't activate that ability");
  }
  if (abilityDef.costsExhaustSelf) {
    if (
      source.controlledSince == state.turn &&
      !hasKeyword(sourceVals, haste)
    ) {
      throw new Error("Source entity has arrival fatigue.");
    }
    if (!source.ready) {
      throw new Error("Source entity is exhausted.");
    }
  }
}

export function doActivateAction(state, action) {
  const source = state.entities[action.source];
  const sourceVals = getCurrentValues(state, source.id);
  const ability = sourceVals.abilities[action.index];
  state.newTriggers.push({
    path: ability.path,
    sourceId: source.id,
    isActivatedAbility: true
  });
  if (sourceVals.abilities[action.index].costsExhaustSelf) {
    state.entities[source.id].ready = false;
  }
}
