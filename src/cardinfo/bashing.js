import { types, colors, specs, targetMode } from "./constants";
import log from "../log";
import { getName } from "../entities";
import { flying } from "./keywords";

const bashingCardInfo = {
  wrecking_ball: {
    color: colors.neutral,
    tech: 1,
    spec: specs.bashing,
    name: "Wrecking Ball",
    type: types.spell,
    cost: 0,
    abilities: [
      {
        isSpellEffect: true,
        targetMode: targetMode.single,
        targetTypes: [types.building],
        action: ({ state, choices }) => {
          state.entities[choices.targetId].damage += 2;
          log.add(
            state,
            `Wrecking Ball deals 2 damage to ${getName(
              state,
              choices.targetId
            )}.`
          );
        }
      }
    ]
  },
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
        targetMode: targetMode.single,
        targetTypes: [types.unit],
        action: ({ state, source, choices }) => {
          state.entities[choices.targetId].damage += 3;
          log.add(
            state,
            `${getName(state, source.id)} deals 3 damage to ${getName(
              state,
              choices.targetId
            )}.`
          );
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
  },
  eggship: {
    color: colors.neutral,
    tech: 2,
    spec: specs.bashing,
    name: "Eggship",
    type: types.unit,
    subtypes: ["Contraption"],
    cost: 4,
    attack: 4,
    hp: 3,
    abilities: [flying]
  }
};

export default bashingCardInfo;
