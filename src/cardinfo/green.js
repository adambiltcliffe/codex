import { colors, types } from "./constants";
import { getCurrentController, getName } from "../entities";
import { givePlayerGold } from "../util";
import log from "../log";

const greenCardInfo = {
  merfolk_prospector: {
    color: colors.green,
    tech: 0,
    name: "Merfolk Prospector",
    type: types.unit,
    subtypes: ["Merfolk"],
    cost: 1,
    attack: 1,
    hp: 1,
    abilities: [
      {
        isActivatedAbility: true,
        costsExhaustSelf: true,
        action: ({ state, source }) => {
          const gain = givePlayerGold(
            state,
            getCurrentController(state, source.id),
            1
          );
          log.add(state, `${getName(state, source.id)} produces ${gain} gold.`);
        }
      }
    ]
  },
  tiger_cub: {
    color: colors.green,
    tech: 0,
    name: "Tiger Cub",
    type: types.unit,
    subtypes: ["Tiger"],
    cost: 2,
    attack: 2,
    hp: 2
  }
};

export default greenCardInfo;
