import log from "../log";
import { types, colors, specs } from "./constants";
import cardInfo from ".";

const finesseCardInfo = {
  starcrossed_starlet: {
    color: colors.neutral,
    tech: 1,
    spec: specs.finesse,
    name: "Star-Crossed Starlet",
    type: types.unit,
    subtypes: ["Virtuoso"],
    cost: 2,
    attack: 3,
    hp: 2,
    abilities: [
      {
        triggerOnUpkeep: true,
        triggerAction: ({ state, source }) => {
          source.damage++;
          log.add(state, `${cardInfo[source.card].name} takes 1 damage.`);
        }
      }
    ]
  }
};

export default finesseCardInfo;
