import { types, colors, specs, targetMode } from "./constants";
import log from "../log";
import {
  flying,
  sparkshot,
  overpower,
  obliterate,
  stealth,
  haste
} from "./abilities/keywords";
import {
  killEntity,
  damageEntity,
  conferKeyword,
  bounceEntity
} from "../entities";
import { attachEffectThisTurn } from "../effects";
import { getAP } from "../util";

const bashingCardInfo = {
  wrecking_ball: {
    color: colors.neutral,
    spec: specs.bashing,
    name: "Wrecking Ball",
    type: types.spell,
    cost: 0,
    abilities: [
      {
        text: "Deal 2 damage to a building.",
        prompt: "Choose a building to damage",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.building],
        action: ({ state, choices }) => {
          damageEntity(state, state.entities[choices.targetId], {
            amount: 2,
            isSpellDamage: true
          });
        }
      }
    ]
  },
  the_boot: {
    color: colors.neutral,
    spec: specs.bashing,
    name: "The Boot",
    type: types.spell,
    subtypes: ["Debuff"],
    cost: 3,
    abilities: [
      {
        text: "Destroy a tech 0 or tech I unit.",
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
  intimidate: {
    color: colors.neutral,
    spec: specs.bashing,
    name: "Intimidate",
    type: types.spell,
    subtypes: ["Debuff"],
    cost: 1,
    abilities: [
      {
        text: "Give a unit or hero -4 ATK this turn.",
        prompt: "Choose a unit or hero to intimidate",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit, types.hero],
        action: ({ state, choices }) => {
          attachEffectThisTurn(state, state.entities[choices.targetId], {
            path: "cardInfo.intimidate.createdEffect"
          });
          log.add(
            state,
            `${
              state.entities[choices.targetId].current.name
            } gets -4 ATK this turn.`
          );
        }
      }
    ],
    createdEffect: {
      modifySubjectValues: ({ subject }) => {
        subject.current.attack -= 4;
      }
    }
  },
  final_smash: {
    color: colors.neutral,
    spec: specs.bashing,
    name: "Final Smash",
    type: types.spell,
    ultimate: true,
    subtypes: ["Debuff"],
    cost: 6,
    abilities: [
      {
        text:
          "Destroy a tech 0 unit, return a tech I unit to its owner's hand, and gain control of a tech II unit.",
        isSpellEffect: true,
        steps: [
          {
            prompt: "Choose a tech 0 unit to destroy",
            hasTargetSymbol: true,
            targetMode: targetMode.single,
            targetTypes: [types.unit],
            canTarget: ({ state, target }) => {
              return target.current.tech == 0;
            },
            action: ({ state, choices }) => {
              killEntity(state, choices.targetId);
            }
          },
          {
            prompt: "Choose a tech 1 unit to return to its owner's hand",
            hasTargetSymbol: true,
            targetMode: targetMode.single,
            targetTypes: [types.unit],
            canTarget: ({ state, target }) => {
              return target.current.tech == 1;
            },
            action: ({ state, choices }) => {
              bounceEntity(state, choices.targetId);
            }
          },
          {
            prompt: "Choose a tech 2 unit to gain control of",
            hasTargetSymbol: true,
            targetMode: targetMode.single,
            targetTypes: [types.unit],
            canTarget: ({ state, target }) => {
              return target.current.tech == 2;
            },
            action: ({ state, choices }) => {
              const ap = getAP(state);
              const target = state.entities[choices.targetId];
              target.defaultController = ap.id;
              log.add(
                state,
                log.fmt`${ap} gains control of ${target.current.name}.`
              );
            }
          }
        ]
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
        text: "Arrives: Deal 3 damage to a unit.",
        prompt: "Choose a unit to stomp",
        triggerOnOwnArrival: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit],
        action: ({ state, source, choices }) => {
          damageEntity(state, state.entities[choices.targetId], {
            amount: 3,
            source,
            isAbilityDamage: true
          });
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
  sneaky_pig: {
    color: colors.neutral,
    tech: 2,
    spec: specs.bashing,
    name: "Sneaky Pig",
    type: types.unit,
    subtypes: ["Pig"],
    cost: 3,
    attack: 3,
    hp: 3,
    abilities: [
      haste,
      {
        text: "Arrives: Gets stealth this turn.",
        triggerOnOwnArrival: true,
        action: ({ state, source }) => {
          attachEffectThisTurn(state, source, {
            path: "cardInfo.sneaky_pig.abilities[1].createdEffect"
          });
          log.add(state, `${source.current.name} gains stealth this turn.`);
        },
        createdEffect: {
          modifySubjectValues: ({ subject }) => {
            conferKeyword(subject, stealth);
          }
        }
      }
    ]
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
        text: "Arrives or attacks: Deal 4 damage to a building.",
        triggerOnOwnArrival: true,
        triggerOnAttack: true,
        prompt: "Choose a building to damage",
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.building],
        action: ({ state, source, choices }) => {
          damageEntity(state, state.entities[choices.targetId], {
            amount: 4,
            source,
            isAbilityDamage: true
          });
        }
      }
    ]
  }
};

export default bashingCardInfo;
