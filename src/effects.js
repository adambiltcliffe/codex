import get from "lodash/get";
import { triggerDefinitions } from "./triggers";

export function attachEffect(state, entity, path) {
  entity.effects.push({ path });
}

export function getEffectDefinition(effect) {
  return get(triggerDefinitions, effect.path);
}
