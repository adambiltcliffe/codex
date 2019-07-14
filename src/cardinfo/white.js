import { colors, types } from "./constants";
import { frenzy, antiAir } from "./keywords";

const whiteCardInfo = {
  fox_primus: {
    color: colors.white,
    tech: 0,
    name: "Fox Primus",
    type: types.unit,
    subtypes: ["Ninja"],
    cost: 3,
    attack: 2,
    hp: 2,
    abilities: [frenzy(1), antiAir]
  }
};

export default whiteCardInfo;
