import log from "../log";
import { types, colors, targetMode } from "./constants";
import { frenzy, haste, healing, resist } from "./keywords";
import { getName } from "../entities";

const neutralCardInfo = {
  timely_messenger: {
    color: colors.neutral,
    tech: 0,
    name: "Timely Messenger",
    type: types.unit,
    subtypes: ["Mercenary"],
    cost: 1,
    attack: 1,
    hp: 1,
    abilities: [haste]
  },
  tenderfoot: {
    color: colors.neutral,
    tech: 0,
    name: "Tenderfoot",
    type: types.unit,
    subtypes: ["Virtuoso"],
    cost: 1,
    attack: 1,
    hp: 2
  },
  older_brother: {
    color: colors.neutral,
    tech: 0,
    name: "Older Brother",
    type: types.unit,
    subtypes: ["Drunkard"],
    cost: 2,
    attack: 2,
    hp: 2
  },
  brick_thief: {
    color: colors.neutral,
    tech: 0,
    name: "Brick Thief",
    type: types.unit,
    subtypes: ["Mercenary"],
    cost: 2,
    attack: 2,
    hp: 1,
    abilities: [
      {
        triggerOnOwnArrival: true,
        steps: [
          {
            targetMode: targetMode.single,
            targetTypes: [types.building],
            action: ({ state, source, choices }) => {
              state.entities[choices.targetId].damage += 1;
              log.add(
                state,
                `${getName(state, source.id)} deals 1 damage to ${getName(
                  state,
                  choices.targetId
                )}.`
              );
            }
          },
          {
            targetMode: targetMode.single,
            targetTypes: [types.building],
            action: ({ state, source, choices }) => {
              state.entities[choices.targetId].damage -= 1;
              log.add(
                state,
                `${getName(state, source.id)} repairs 1 damage from ${getName(
                  state,
                  choices.targetId
                )}.`
              );
            }
          }
        ]
      },
      resist(1)
    ]
  },
  helpful_turtle: {
    color: colors.neutral,
    tech: 0,
    name: "Helpful Turtle",
    type: types.unit,
    subtypes: ["Cute Animal"],
    cost: 2,
    attack: 1,
    hp: 2,
    abilities: [healing(1)]
  },
  fruit_ninja: {
    color: colors.neutral,
    tech: 0,
    name: "Fruit Ninja",
    type: types.unit,
    subtypes: ["Ninja"],
    cost: 3,
    attack: 2,
    hp: 2,
    abilities: [frenzy(1)]
  }
};

export default neutralCardInfo;
