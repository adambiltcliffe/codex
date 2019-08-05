import log from "../../log";
import { andJoin, getAP } from "../../util";
import { getName, getCurrentValues } from "../../entities";

import forEach from "lodash/forEach";
import sum from "lodash/sum";

function keyword(k) {
  return { keyword: k };
}

function numericKeyword(k) {
  return v => ({ keyword: k, value: v });
}

export function hasKeyword(entityVals, kwAbility) {
  return entityVals.abilities.some(a => a.keyword == kwAbility.keyword);
}

export function sumKeyword(entityVals, kwAbilityCreator) {
  const kwAbility = kwAbilityCreator(null);
  return sum(
    entityVals.abilities
      .filter(a => a.keyword == kwAbility.keyword)
      .map(ka => ka.value)
  );
}

export const haste = keyword("K_HASTE");
export const flying = keyword("K_FLYING");
export const antiAir = keyword("K_ANTIAIR");
export const invisible = keyword("K_INVISIBLE");
export const flagbearer = keyword("K_FLAGBEARER");
export const readiness = keyword("K_READINESS");
export const sparkshot = keyword("K_SPARKSHOT");
export const overpower = keyword("K_OVERPOWER");
export const swiftStrike = keyword("K_SWIFTSTRIKE");

export const resist = numericKeyword("KV_RESIST");

export function frenzy(n) {
  return {
    modifyOwnValues: ({ state, self }) => {
      if (self.current.controller == getAP(state).id) {
        self.current.attack += n;
      }
    }
  };
}

export function healing(n) {
  return {
    triggerOnUpkeep: true,
    action: ({ state, source }) => {
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
