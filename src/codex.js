import cardInfo, { types, specs } from "./cardinfo";

import reduce from "lodash/reduce";

export const playableSpecs = [specs.bashing];

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
