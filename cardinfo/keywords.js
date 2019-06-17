import log from "../log";
import forEach from "lodash/forEach";
import { andJoin } from "../util";
import cardInfo from ".";

export function healing(n) {
  return {
    triggerOnUpkeep: true,
    triggerAction: ({ state, source }) => {
      const healed = [];
      forEach(state.units, u => {
        if (u.controller == source.controller && u.damage > 0) {
          healed.push(cardInfo[u.card].name);
          u.damage -= n;
          if (u.damage < 0) {
            u.damage = 0;
          }
        }
      });
      if (healed.length > 0) {
        log.add(
          state,
          `${cardInfo[source.card].name} heals ${1} damage from ${andJoin(
            healed
          )}.`
        );
      }
    }
  };
}
