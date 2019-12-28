import { colors, types, targetMode } from "./constants";
import { queueDamage } from "../damage";
import { haste, frenzy } from "./abilities/keywords";
import { fixtureNames } from "../fixtures";
import { getAP } from "../util";
import { conferKeyword } from "../entities";

import find from "lodash/find";

const redCardInfo = {
  nautical_dog: {
    color: colors.red,
    tech: 0,
    name: "Nautical Dog",
    type: types.unit,
    subtypes: ["Dog"],
    cost: 1,
    attack: 1,
    hp: 1,
    abilities: [frenzy(1)]
  },
  mad_man: {
    color: colors.red,
    tech: 0,
    name: "Mad Man",
    type: types.unit,
    subtypes: ["Brigand"],
    cost: 1,
    attack: 1,
    hp: 1,
    abilities: [haste]
  },
  careless_musketeer: {
    color: colors.red,
    tech: 0,
    name: "Careless Musketeer",
    type: types.unit,
    subtypes: ["Pirate"],
    cost: 2,
    attack: 2,
    hp: 1,
    abilities: [
      {
        text:
          "⤵ → Deal 1 damage to a unit or building and 1 damage to your base.",
        prompt: "Choose a unit or building to damage",
        isActivatedAbility: true,
        costsExhaustSelf: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit, types.building],
        action: ({ state, source, choices }) => {
          queueDamage(state, {
            amount: 1,
            sourceId: source.id,
            subjectId: choices.targetId,
            isAbilityDamage: true
          });
          const ownBase = find(
            state.entities,
            e => e.fixture == fixtureNames.base && e.owner == getAP(state).id
          );
          if (ownBase) {
            queueDamage(state, {
              amount: 1,
              sourceId: source.id,
              subjectId: ownBase.id,
              isAbilityDamage: true
            });
          }
        }
      }
    ]
  },
  scorch: {
    color: colors.red,
    name: "Scorch",
    type: types.spell,
    minor: true,
    subtypes: ["Burn"],
    cost: 3,
    abilities: [
      {
        text: "Deal 2 damage to a patroller or building.",
        prompt: "Choose a patroller or building to damage",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit, types.building],
        canTarget: ({ state, target }) =>
          target.current.type == types.building ||
          state.players[target.current.controller].patrollerIds.includes(
            target.id
          ),
        action: ({ state, choices }) => {
          queueDamage(state, {
            amount: 2,
            subjectId: choices.targetId,
            isSpellDamage: true
          });
        }
      }
    ]
  },
  charge: {
    color: colors.red,
    name: "Charge",
    type: types.spell,
    minor: true,
    subtypes: ["Buff"],
    cost: 2,
    abilities: [
      {
        text: "Give one of your units haste and +1 ATK this turn.",
        prompt: "Choose one of your units to buff",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit],
        canTarget: ({ state, target }) =>
          target.current.controller == getAP(state).id,
        action: ({ state, choices }) => {
          attachEffectThisTurn(state, state.entities[choices.targetId], {
            path: "cardInfo.intimidate.createdEffect"
          });
          log.add(
            state,
            `${
              state.entities[choices.targetId].current.name
            } gets haste and +1 ATK this turn.`
          );
        }
      }
    ],
    createdEffect: {
      modifySubjectValues: ({ subject }) => {
        subject.current.attack -= 4;
        conferKeyword(subject, haste);
      }
    }
  }
};

export default redCardInfo;
