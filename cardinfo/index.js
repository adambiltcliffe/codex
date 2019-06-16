import log from "../log";
import forEach from "lodash/forEach";
import { andJoin } from "../util";

export const types = {
  unit: "UNIT",
  spell: "SPELL",
  building: "BUILDING",
  upgrade: "UPGRADE"
};

export const colors = {
  red: "RED",
  green: "GREEN",
  white: "WHITE",
  black: "BLACK",
  blue: "BLUE",
  purple: "PURPLE",
  neutral: "NEUTRAL"
};

export const specs = {
  bashing: "BASHING",
  finesse: "FINESSE"
};

function healing(n) {
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

const cardInfo = {
  tenderfoot: {
    color: colors.neutral,
    tech: 0,
    name: "Tenderfoot",
    type: types.unit,
    subtypes: ["Virtuoso"],
    cost: 1,
    attack: 1,
    hp: 2
  },
  older_brother: {
    color: colors.neutral,
    tech: 0,
    name: "Older Brother",
    type: types.unit,
    subtypes: ["Drunkard"],
    cost: 2,
    attack: 2,
    hp: 2
  },
  iron_man: {
    color: colors.neutral,
    tech: 1,
    spec: specs.bashing,
    name: "Iron Man",
    type: types.unit,
    subtypes: ["Mercenary"],
    cost: 3,
    attack: 3,
    hp: 4
  },
  regularsized_rhinoceros: {
    color: colors.neutral,
    tech: 2,
    spec: specs.bashing,
    name: "Regular-sized Rhinoceros",
    type: types.unit,
    subtypes: ["Rhino"],
    cost: 4,
    attack: 5,
    hp: 6
  },
  starcrossed_starlet: {
    color: colors.neutral,
    tech: 1,
    spec: specs.finesse,
    name: "Star-Crossed Starlet",
    type: types.unit,
    subtypes: ["Virtuoso"],
    cost: 2,
    attack: 3,
    hp: 2,
    abilities: [
      {
        triggerOnUpkeep: true,
        triggerAction: ({ state, source }) => {
          source.damage++;
          log.add(state, `${cardInfo[source.card].name} takes 1 damage.`);
        }
      }
    ]
  },
  helpful_turtle: {
    color: colors.neutral,
    tech: 0,
    name: "Helpful Turtle",
    type: types.unit,
    subtypes: ["Cute Animal"],
    cost: 2,
    attack: 1,
    hp: 2,
    abilities: [healing(1)]
  }
};

export default cardInfo;
