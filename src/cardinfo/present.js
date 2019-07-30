import { colors, types } from "./constants";
import { readiness } from "./abilities/keywords";

const presentCardInfo = {
  argonaut: {
    color: colors.purple,
    tech: 2,
    name: "Argonaut",
    type: types.unit,
    subtypes: ["Soldier"],
    cost: 3,
    attack: 3,
    hp: 4,
    abilities: [readiness]
  }
};

export default presentCardInfo;
