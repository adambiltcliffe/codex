import { types, colors } from "./constants";
import { haste, healing } from "./keywords";

const neutralCardInfo = {
  timely_messenger: {
    color: colors.neutral,
    tech: 0,
    name: "Timely Messenger",
    type: types.unit,
    subtypes: ["Mercenary"],
    cost: 1,
    attack: 1,
    hp: 1,
    abilities: [haste]
  },
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

export default neutralCardInfo;
