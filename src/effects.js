import { triggerDefinitions } from "./triggers";

import get from "lodash/get";
import forEach from "lodash/forEach";

export function attachEffect(state, entity, path) {
  entity.effects.push({ path });
}

export function attachEffectThisTurn(state, entity, path) {
  entity.effects.push({ path, finalActiveTurn: state.turn });
}

export function getEffectDefinition(effect) {
  return get(triggerDefinitions, effect.path);
}

export function expireEffects(state) {
  forEach(state.entities, e => {
    e.effects = e.effects.filter(
      fx => fx.finalActiveTurn === undefined || state.turn <= fx.finalActiveTurn
    );
  });
}
