import { colors, types, targetMode } from "./constants";
import { queueDamage } from "../damage";
import { haste, frenzy, cantPatrol } from "./abilities/keywords";
import { fixtureNames } from "../fixtures";
import { getAP } from "../util";
import { conferKeyword, bounceEntity } from "../entities";

import { attachEffectThisTurn } from "../effects";
import log from "../log";

import find from "lodash/find";
import some from "lodash/some";
import clamp from "lodash/clamp";

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
  bombaster: {
    color: colors.red,
    tech: 0,
    name: "Bombaster",
    type: types.unit,
    subtypes: ["Pirate"],
    cost: 2,
    attack: 2,
    hp: 2,
    abilities: [
      {
        text: "①, Sacrifice Bombaster → Deal 2 damage to a patrolling unit.",
        prompt: "Choose a patrolling unit to damage",
        isActivatedAbility: true,
        costsSacrificeSelf: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit],
        canTarget: ({ state, target }) => target.current.patrolSlot !== null,
        action: ({ state, source, choices }) => {
          queueDamage(state, {
            amount: 2,
            sourceName: state.currentTrigger.sourceName,
            subjectId: choices.targetId,
            isAbilityDamage: true
          });
        }
      }
    ]
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
  bloodrage_ogre: {
    color: colors.red,
    tech: 0,
    name: "Bloodrage Ogre",
    type: types.unit,
    subtypes: ["Ogre"],
    cost: 2,
    attack: 3,
    hp: 2,
    abilities: [
      {
        text:
          "End of turn: Return Bloodrage Ogre to his owner's hand if he didn't arrive or attack this turn.",
        triggerAtEndOfTurn: true,
        shouldTrigger: ({ state, source }) => {
          return (
            getAP(state).id == source.current.controller &&
            !source.thisTurn.arrived &&
            source.thisTurn.attacks === undefined
          );
        },
        action: ({ state, source }) => {
          bounceEntity(state, source.id);
        }
      }
    ]
  },
  makeshift_rambaster: {
    color: colors.red,
    tech: 0,
    name: "Makeshift Rambaster",
    type: types.unit,
    subtypes: ["Contraption"],
    cost: 2,
    attack: 1,
    hp: 2,
    abilities: [
      haste,
      {
        text: "+2 ATK when attacking buildings.",
        modifyOwnValues: ({ state, self }) => {
          if (
            state.currentAttack &&
            state.currentAttack.attacker == self.id &&
            state.entities[state.currentAttack.target].current.type ==
              types.building
          ) {
            self.current.attack += 2;
          }
        }
      },
      cantPatrol
    ]
  },
  bloodburn: {
    color: colors.red,
    tech: 0,
    name: "Bloodburn",
    type: types.upgrade,
    cost: 3,
    abilities: [
      {
        text: "Whenever a unit dies, put a blood rune on this (limit: 4).",
        triggerOnEntityDies: true,
        shouldTrigger: ({ state, victim }) => victim.current.type == types.unit,
        action: ({ state, source }) => {
          if (!source.namedRunes.blood || source.namedRunes.blood < 4) {
            source.namedRunes.blood = (source.namedRunes.blood || 0) + 1;
            log.add(state, `${source.current.name} gains a blood rune.`);
          }
        }
      },
      {
        text:
          "⤵, remove two blood runes → Deal 1 damage to a unit or building.",
        prompt: "Choose a unit or building to damage",
        isActivatedAbility: true,
        costsExhaustSelf: true,
        costsNamedRunes: { blood: 2 },
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
        targetTypes: [types.unit, types.building, types.hero],
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
            path: "cardInfo.charge.createdEffect"
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
        subject.current.attack += 1;
        conferKeyword(subject, haste);
      }
    }
  },
  pillage: {
    color: colors.red,
    name: "Pillage",
    type: types.spell,
    minor: true,
    cost: 1,
    abilities: [
      {
        text:
          "Deal 1 damage to a base. Steal ① from that player. If you have a Pirate, instead deal 2 damage and steal ②.",
        prompt: "Choose a base to pillage",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.building],
        canTarget: ({ target }) => target.fixture == fixtureNames.base,
        action: ({ state, choices }) => {
          const ap = getAP(state);
          const hasPirate = some(
            state.entities,
            e =>
              e.current.controller == ap.id &&
              e.current.subtypes.includes("Pirate")
          );
          const amount = hasPirate ? 2 : 1;
          queueDamage(state, {
            amount,
            subjectId: choices.targetId,
            isSpellDamage: true
          });
          const victim =
            state.players[state.entities[choices.targetId].current.controller];
          if (victim.id !== ap.id) {
            const goldStolen = clamp(amount, 0, victim.gold);
            if (goldStolen > 0) {
              ap.gold += goldStolen;
              victim.gold -= goldStolen;
              log.add(
                state,
                log.fmt`${ap} steals ${goldStolen} gold from ${victim}.`
              );
            }
          }
        }
      }
    ]
  }
};

export default redCardInfo;
