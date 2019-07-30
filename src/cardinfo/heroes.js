import { colors, types } from "./constants";

const heroCardInfo = {
  troq_bashar: {
    color: colors.neutral,
    name: "Troq Bashar",
    title: "Renegade Beast",
    type: types.hero,
    cost: 2,
    midbandLevel: 5,
    maxbandLevel: 8,
    bands: [{ attack: 2, hp: 3 }, { attack: 3, hp: 4 }, { attack: 4, hp: 5 }]
  }
};

export default heroCardInfo;
