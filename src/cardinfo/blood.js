import { colors, types, specs } from "./constants";
import { flying, haste, ephemeral, overpower } from "./abilities/keywords";

const bloodCardInfo = {
  shoddy_glider: {
    color: colors.red,
    tech: 2,
    spec: specs.blood,
    name: "Shoddy Glider",
    type: types.unit,
    subtypes: ["Contraption"],
    cost: 1,
    attack: 3,
    hp: 1,
    abilities: [haste, ephemeral, flying]
  },
  crashbarrow: {
    color: colors.red,
    tech: 2,
    spec: specs.blood,
    name: "Crashbarrow",
    type: types.unit,
    subtypes: ["Contraption"],
    cost: 3,
    attack: 6,
    hp: 2,
    abilities: [haste, ephemeral, overpower]
  }
};

export default bloodCardInfo;
