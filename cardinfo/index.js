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

const cardInfo = {
  tf: {
    color: colors.neutral,
    tech: 0,
    name: "Tenderfoot",
    type: types.unit,
    subtypes: ["Virtuoso"],
    cost: 1,
    attack: 1,
    hp: 2
  },
  ob: {
    color: colors.neutral,
    tech: 0,
    name: "Older Brother",
    type: types.unit,
    subtypes: ["Drunkard"],
    cost: 2,
    attack: 2,
    hp: 2
  },
  im: {
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
  rr: {
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

export default cardInfo;
