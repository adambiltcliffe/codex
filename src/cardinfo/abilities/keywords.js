import log from "../../log";
import { andJoin, getAP } from "../../util";
import { getCurrentValues } from "../../entities";

import forEach from "lodash/forEach";
import sum from "lodash/sum";

export { obliterate } from "./obliterate";

function keyword(k, display, fullText) {
  if (fullText) {
    return { keyword: k, text: display };
  }
  return { keyword: k, renderKeyword: display };
}

function numericKeyword(k, display) {
  return v => ({
    keyword: k,
    value: v,
    renderKeyword: display,
    renderKeywordSum: true
  });
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

export const haste = keyword("K_HASTE", "haste");
export const flying = keyword("K_FLYING", "flying");
export const antiAir = keyword("K_ANTIAIR", "anti-air");
export const invisible = keyword("K_INVISIBLE", "invisible");
export const readiness = keyword("K_READINESS", "readiness");
export const sparkshot = keyword("K_SPARKSHOT", "sparkshot");
export const overpower = keyword("K_OVERPOWER", "overpower");
export const swiftStrike = keyword("K_SWIFTSTRIKE", "swift strike");
export const stealth = keyword("K_STEALTH", "stealth");
export const unstoppable = keyword("K_UNSTOPPABLE", "unstoppable");
export const longRange = keyword("K_LONGRANGE", "long-range");

export const flippable = keyword(
  "K_FLIPPABLE",
  'When you "stop the music", flip this.',
  true
);
export const flagbearer = keyword(
  "K_FLAGBEARER",
  "Whenever an opponent plays a spell or ability that can ◎ a flagbearer, it must ◎ a flagbearer at least once.",
  true
);

export const resist = numericKeyword("KV_RESIST", "resist");

export const frenzy = n => ({
  modifyOwnValues: ({ state, self }) => {
    if (self.current.controller == getAP(state).id) {
      self.current.attack += n;
    }
  },
  renderKeyword: "frenzy",
  renderKeywordSum: true,
  value: n
});

export const healing = n => ({
  text: `Healing ${n}`,
  triggerOnUpkeep: true,
  action: ({ state, source }) => {
    const healed = [];
    const allVals = getCurrentValues(state, Object.keys(state.entities));
    forEach(state.entities, u => {
      if (
        allVals[u.id].controller == allVals[source.id].controller &&
        u.damage > 0
      ) {
        healed.push(u.current.name);
        u.damage -= n;
        if (u.damage < 0) {
          u.damage = 0;
        }
      }
    });
    if (healed.length > 0) {
      log.add(
        state,
        `${source.current.name} heals ${1} damage from ${andJoin(healed)}.`
      );
    }
  },
  renderKeyword: "healing",
  renderKeywordSum: true,
  value: n
});

export const channeling = {
  mustSacrifice: ({ state, source }) => {
    const p = source.current.controller;
    return !state.players[p].current.heroSpecs.includes(source.current.spec);
  },
  renderKeyword: "channeling"
};
