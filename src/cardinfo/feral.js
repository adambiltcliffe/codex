import { specs, colors, types } from "./constants";
import { sparkshot, antiAir, resist, overpower } from "./abilities/keywords";

const feralCardInfo = {
  huntress: {
    color: colors.green,
    tech: 1,
    spec: specs.feral,
    name: "Huntress",
    type: types.unit,
    subtypes: ["Centaur"],
    cost: 2,
    attack: 3,
    hp: 3,
    abilities: [sparkshot, antiAir]
  },
  barkcoat_bear: {
    color: colors.green,
    tech: 2,
    spec: specs.feral,
    name: "Barkcoat Bear",
    type: types.unit,
    subtypes: ["Bear"],
    cost: 4,
    attack: 5,
    hp: 5,
    abilities: [resist(2), overpower]
  }
};

export default feralCardInfo;
