import { triggerDefinitions } from "./triggers";

import get from "lodash/get";
import forEach from "lodash/forEach";
import clamp from "lodash/clamp";
import partition from "lodash/partition";

export function attachEffect(state, entity, effect) {
  entity.effects.push(effect);
  const fxDef = getEffectDefinition(effect);
  if (fxDef.armor !== undefined) {
    entity.armor += fxDef.armor;
  }
}

export function attachEffectThisTurn(state, entity, effect) {
  attachEffect(state, entity, { ...effect, finalActiveTurn: state.turn });
}

export function getEffectDefinition(effect) {
  return get(triggerDefinitions, effect.path);
}

export function expireEffects(state) {
  forEach(state.entities, e => {
    const [expired, alive] = partition(
      e.effects,
      fx => fx.finalActiveTurn !== undefined && state.turn > fx.finalActiveTurn
    );
    forEach(expired, fx => {
      const fxDef = getEffectDefinition(fx);
      if (fxDef.armor !== undefined) {
        e.armor = clamp(e.armor - fxDef.armor, 0, e.armor);
      }
    });
    e.effects = alive;
  });
}
