import log from "../log";
import forEach from "lodash/forEach";
import { andJoin, getAP } from "../util";
import { getName, getCurrentValues } from "../entities";

function keyword(k) {
  return { keyword: k };
}

export function hasKeyword(entityVals, kwAbility) {
  return entityVals.abilities.some(a => a.keyword == kwAbility.keyword);
}

export const haste = keyword("K_HASTE");
export const flying = keyword("K_FLYING");
export const antiAir = keyword("K_ANTIAIR");
export const invisible = keyword("K_INVISIBLE");

export function frenzy(n) {
  return {
    modifyOwnValues: ({ state, values }) => {
      if (values.controller == getAP(state).id) {
        values.attack += n;
      }
    }
  };
}

export function healing(n) {
  return {
    triggerOnUpkeep: true,
    triggerAction: ({ state, source }) => {
      const healed = [];
      const allVals = getCurrentValues(state, Object.keys(state.entities));
      forEach(state.entities, u => {
        if (
          allVals[u.id].controller == allVals[source.id].controller &&
          u.damage > 0
        ) {
          healed.push(getName(state, u.id));
          u.damage -= n;
          if (u.damage < 0) {
            u.damage = 0;
          }
        }
      });
      if (healed.length > 0) {
        log.add(
          state,
          `${getName(state, source.id)} heals ${1} damage from ${andJoin(
            healed
          )}.`
        );
      }
    }
  };
}
