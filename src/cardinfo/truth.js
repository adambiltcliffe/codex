import { colors, specs, types } from "./constants";
import { flying } from "./abilities/keywords";

const truthCardInfo = {
  spectral_roc: {
    color: colors.blue,
    tech: 2,
    spec: specs.truth,
    name: "Spectral Roc",
    type: types.unit,
    subtypes: ["Bird", "Illusion"],
    cost: 4,
    attack: 4,
    hp: 5,
    abilities: [flying]
  }
};

export default truthCardInfo;
