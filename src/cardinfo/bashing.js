import { types, colors, specs } from "./constants";

const bashingCardInfo = {
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
  }
};

export default bashingCardInfo;
