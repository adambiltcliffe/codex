import log from "../log";
import { types, colors, targetMode } from "./constants";
import {
  frenzy,
  haste,
  healing,
  resist,
  flagbearer
} from "./abilities/keywords";
import { damageEntity } from "../entities";

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
        text:
          "Arrives or attacks: Deal 1 damage to a building and repair 1 damage from another building.",
        triggerOnOwnArrival: true,
        triggerOnAttack: true,
        steps: [
          {
            prompt: "Choose a building to damage",
            hasTargetSymbol: true,
            targetMode: targetMode.single,
            targetTypes: [types.building],
            action: ({ state, source, choices }) => {
              damageEntity(state, state.entities[choices.targetId], {
                amount: 1,
                source,
                isAbilityDamage: true
              });
            }
          },
          {
            prompt: "Choose a building to repair",
            hasTargetSymbol: true,
            targetMode: targetMode.single,
            targetTypes: [types.building],
            canTarget: ({ state, target, triggerInfo }) => {
              return target.id != triggerInfo.choices[0].targetId;
            },
            action: ({ state, source, choices }) => {
              if (state.entities[choices.targetId].damage > 0) {
                state.entities[choices.targetId].damage -= 1;
                log.add(
                  state,
                  `${source.current.name} repairs 1 damage from ${state.entities[choices.targetId].current.name}.`
                );
              }
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
  granfalloon_flagbearer: {
    color: colors.neutral,
    tech: 0,
    name: "Granfalloon Flagbearer",
    type: types.unit,
    subtypes: ["Flagbearer"],
    cost: 3,
    attack: 2,
    hp: 2,
    abilities: [flagbearer]
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
  },
  spark: {
    color: colors.neutral,
    name: "Spark",
    type: types.spell,
    minor: true,
    subtypes: ["Burn"],
    cost: 1,
    abilities: [
      {
        text: "Deal 1 damage to a patroller.",
        prompt: "Choose a patroller to damage",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit, types.hero],
        canTarget: ({ state, target }) =>
          state.players[target.current.controller].patrollerIds.includes(
            target.id
          ),
        action: ({ state, choices }) => {
          damageEntity(state, state.entities[choices.targetId], {
            amount: 1,
            isSpellDamage: true
          });
        }
      }
    ]
  },
  bloom: {
    color: colors.neutral,
    name: "Bloom",
    type: types.spell,
    minor: true,
    subtypes: ["Buff"],
    cost: 2,
    abilities: [
      {
        text:
          "Put a +1/+1 rune on a friendly unit or hero that doesn't have a +1/+1 rune.",
        prompt: "Choose a friendly unit or hero to put a +1/+1 rune on",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit, types.hero],
        canTarget: ({ state, target }) => target.runes <= 0,
        action: ({ state, choices }) => {
          state.entities[choices.targetId].runes += 1;
          log.add(
            state,
            `Bloom adds a +1/+1 rune to ${state.entities[choices.targetId].current.name}.`
          );
        }
      }
    ]
  },
  wither: {
    color: colors.neutral,
    name: "Wither",
    type: types.spell,
    minor: true,
    subtypes: ["Debuff"],
    cost: 2,
    abilities: [
      {
        text: "Put a -1/-1 rune on a unit or hero.",
        prompt: "Choose a unit or hero to put a -1/-1 rune on",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit, types.hero],
        action: ({ state, choices }) => {
          state.entities[choices.targetId].runes -= 1;
          log.add(
            state,
            `Wither adds a -1/-1 rune to ${state.entities[choices.targetId].current.name}.`
          );
        }
      }
    ]
  }
};

export default neutralCardInfo;
