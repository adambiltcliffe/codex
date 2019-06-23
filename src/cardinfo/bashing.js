import { types, colors, specs } from "./constants";
import log from "../log";
import { getName } from "../entities";

const bashingCardInfo = {
  iron_man: {
    color: colors.neutral,
    tech: 1,
    spec: specs.bashing,
    name: "Iron Man",
    type: types.unit,
    subtypes: ["Mercenary"],
    cost: 3,
    attack: 3,
    hp: 4
  },
  hired_stomper: {
    color: colors.neutral,
    tech: 2,
    spec: specs.bashing,
    name: "Hired Stomper",
    type: types.unit,
    subtypes: ["Lizardman"],
    cost: 4,
    attack: 4,
    hp: 3,
    abilities: [
      {
        triggerOnOwnArrival: true,
        triggerAction: ({ state, source }) => {
          log.add(state, `${getName(state, source.id)} goes BAM!`);
        }
      }
    ]
  },
  regularsized_rhinoceros: {
    color: colors.neutral,
    tech: 2,
    spec: specs.bashing,
    name: "Regular-sized Rhinoceros",
    type: types.unit,
    subtypes: ["Rhino"],
    cost: 4,
    attack: 5,
    hp: 6
  }
};

export default bashingCardInfo;
