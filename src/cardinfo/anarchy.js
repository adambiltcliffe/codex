import { colors, types, specs } from "./constants";
import {
  longRange,
  resist,
  flying,
  haste,
  obliterate
} from "./abilities/keywords";

const anarchyCardInfo = {
  pirate_gunship: {
    color: colors.red,
    tech: 3,
    spec: specs.anarchy,
    name: "Pirate Gunship",
    type: types.unit,
    subtypes: ["Contraption", "Airship"],
    cost: 6,
    attack: 7,
    hp: 6,
    abilities: [flying, haste, longRange, resist(2), obliterate(2)]
  }
};

export default anarchyCardInfo;
