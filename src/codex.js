import cardInfo, { types, specs } from "./cardinfo";

import findKey from "lodash/findKey";
import reduce from "lodash/reduce";

export const playableSpecs = [specs.bashing, specs.finesse];

export function getHero(spec) {
  return findKey(cardInfo, v => v.type == types.hero && v.spec == spec);
}

export function buildStarterDeck(color) {
  return reduce(
    cardInfo,
    (a, v, k) => {
      return v.color == color && v.spec === undefined && !v.token
        ? a.concat(k)
        : a;
    },
    []
  );
}

export function buildSingleCodex(spec) {
  return reduce(
    cardInfo,
    (a, v, k) => {
      return v.spec == spec && v.type != types.hero
        ? a.concat({ card: k, n: 2 })
        : a;
    },
    []
  );
}
