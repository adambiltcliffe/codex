import { specs, colors, types } from "./constants";
import { haste, swiftStrike } from "./abilities/keywords";

const ninjutsuCardInfo = {
  glorious_ninja: {
    color: colors.white,
    tech: 2,
    spec: specs.ninjutsu,
    name: "Glorious Ninja",
    type: types.unit,
    subtypes: ["Ninja"],
    cost: 5,
    attack: 4,
    hp: 3,
    abilities: [haste, swiftStrike]
  }
};

export default ninjutsuCardInfo;
