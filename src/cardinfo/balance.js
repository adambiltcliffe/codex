import { specs, colors, types } from "./constants";
import { stealth } from "./abilities/keywords";

const balanceCardInfo = {
  chameleon: {
    color: colors.green,
    tech: 2,
    spec: specs.balance,
    name: "Chameleon",
    type: types.unit,
    subtypes: ["Beast"],
    cost: 2,
    attack: 3,
    hp: 3,
    abilities: [stealth]
  }
};

export default balanceCardInfo;
