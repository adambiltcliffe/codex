import { types, colors, specs, targetMode } from "./constants";
import log from "../log";
import { flying, sparkshot, overpower, obliterate } from "./abilities/keywords";
import { killEntity } from "../entities";

const bashingCardInfo = {
  wrecking_ball: {
    color: colors.neutral,
    spec: specs.bashing,
    name: "Wrecking Ball",
    type: types.spell,
    cost: 0,
    abilities: [
      {
        prompt: "Choose a building to damage",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.building],
        action: ({ state, choices }) => {
          state.entities[choices.targetId].damage += 2;
          log.add(
            state,
            `Wrecking Ball deals 2 damage to ${
              state.entities[choices.targetId].current.name
            }.`
          );
        }
      }
    ]
  },
  the_boot: {
    color: colors.neutral,
    spec: specs.bashing,
    name: "The Boot",
    type: types.spell,
    cost: 3,
    abilities: [
      {
        prompt: "Choose a unit to destroy",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit],
        canTarget: ({ state, target }) => {
          return target.current.tech < 2;
        },
        action: ({ state, source, choices }) => {
          killEntity(state, choices.targetId);
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
  revolver_ocelot: {
    color: colors.neutral,
    tech: 1,
    spec: specs.bashing,
    name: "Revolver Ocelot",
    type: types.unit,
    subtypes: ["Leopard"],
    cost: 2,
    attack: 3,
    hp: 3,
    abilities: [sparkshot]
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
        prompt: "Choose a unit to stomp",
        triggerOnOwnArrival: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit],
        action: ({ state, source, choices }) => {
          state.entities[choices.targetId].damage += 3;
          log.add(
            state,
            `${source.current.name} deals 3 damage to ${
              state.entities[choices.targetId].current.name
            }.`
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
  },
  harvest_reaper: {
    color: colors.neutral,
    tech: 2,
    spec: specs.bashing,
    name: "Harvest Reaper",
    type: types.unit,
    subtypes: ["Contraption"],
    cost: 5,
    attack: 6,
    hp: 5,
    abilities: [overpower]
  },
  trojan_duck: {
    color: colors.neutral,
    tech: 3,
    spec: specs.bashing,
    name: "Trojan Duck",
    type: types.unit,
    subtypes: ["Contraption"],
    cost: 7,
    attack: 8,
    hp: 9,
    abilities: [
      obliterate(2),
      {
        triggerOnOwnArrival: true,
        triggerOnAttack: true,
        prompt: "Choose a building to damage",
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.building],
        action: ({ state, source, choices }) => {
          state.entities[choices.targetId].damage += 4;
          log.add(
            state,
            `${source.current.name} deals 4 damage to ${
              state.entities[choices.targetId].current.name
            }.`
          );
        }
      }
    ]
  }
};

export default bashingCardInfo;
