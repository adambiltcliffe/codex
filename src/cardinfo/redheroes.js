import {
  colors,
  types,
  specs,
  targetMode,
  patrolSlots,
  patrolSlotNames
} from "./constants";
import { sparkshot, haste } from "./abilities/keywords";
import { queueDamage } from "../damage";
import { getAP } from "../util";
import log from "../log";
import { drawCards } from "../draw";
import { changePatrolSlot } from "../patrolzone";

const redHeroCardInfo = {
  captain_zane: {
    color: colors.red,
    spec: specs.anarchy,
    name: "Captain Zane",
    title: "Blood Guard Anarchist",
    type: types.hero,
    cost: 2,
    midbandLevel: 4,
    maxbandLevel: 6,
    bands: [
      { attack: 2, hp: 2, abilities: [haste] },
      {
        attack: 3,
        hp: 3,
        abilities: [
          {
            text: "Whenever Zane kills a scavenger, get ①.",
            triggerOnDamageEntity: true,
            shouldTrigger: ({ state, packet, isLethal }) => {
              return (
                isLethal &&
                state.entities[packet.subjectId].current.patrolSlot ==
                  patrolSlots.scavenger
              );
            },
            action: ({ state }) => {
              const ap = getAP(state);
              ap.gold += 1;
              log.add(
                state,
                log.fmt`${ap} gains 1 gold from killing a scavenger.`
              );
            }
          },
          {
            text: "Whenever Zane kills a technician, draw a card.",
            triggerOnDamageEntity: true,
            shouldTrigger: ({ state, packet, isLethal }) => {
              return (
                isLethal &&
                state.entities[packet.subjectId].current.patrolSlot ==
                  patrolSlots.technician
              );
            },
            action: ({ state }) => {
              const ap = getAP(state);
              drawCards(state, ap.id, 1, " from killing a technician");
            }
          }
        ]
      },
      {
        attack: 4,
        hp: 4,
        abilities: [
          {
            text:
              "Max level: Shove a patroller to an empty slot in its patrol zone, then deal 1 damage to it. ◎",
            triggerOnMaxLevel: true,
            steps: [
              {
                prompt: "Choose a patroller to shove",
                hasTargetSymbol: true,
                targetMode: targetMode.single,
                targetTypes: [types.unit, types.hero],
                canTarget: ({ target }) => target.current.patrolSlot !== null,
                action: () => {}
              },
              {
                prompt: "Choose a patrol slot to shove the target to",
                targetMode: targetMode.modal,
                options: patrolSlotNames,
                getLegalOptions: ({ state }) => {
                  const dp =
                    state.players[
                      state.entities[
                        state.currentTrigger.steps[0].choices.targetId
                      ].current.controller
                    ];
                  return range(5).filter(
                    index => dp.patrollerIds[index] === null
                  );
                },
                action: ({ state }) => {
                  changePatrolSlot(
                    state,
                    state.entities[state.currentTrigger.choices[0].targetId],
                    state.currentTrigger.choices[1].index
                  );
                }
              },
              {
                action: ({ state, source }) => {
                  queueDamage(state, {
                    amount: 1,
                    sourceId: source.id,
                    subjectId: state.currentTrigger.choices[0].targetId,
                    isAbilityDamage: true
                  });
                }
              }
            ]
          }
        ]
      }
    ]
  },
  jaina_stormborne: {
    color: colors.red,
    spec: specs.fire,
    name: "Jaina Stormborne",
    title: "Phoenix Archer",
    type: types.hero,
    cost: 2,
    midbandLevel: 4,
    maxbandLevel: 7,
    bands: [
      { attack: 2, hp: 3, abilities: [sparkshot] },
      {
        attack: 3,
        hp: 3,
        abilities: [
          {
            text: "⤵ → Deal 1 damage to a patrolling unit or building. ◎",
            prompt: "Choose a patrolling unit or building to damage",
            isActivatedAbility: true,
            costsExhaustSelf: true,
            hasTargetSymbol: true,
            targetMode: targetMode.single,
            targetTypes: [types.unit, types.building],
            canTarget: ({ state, target }) =>
              target.current.type == types.building ||
              state.players[target.current.controller].patrollerIds.includes(
                target.id
              ),
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
      {
        attack: 4,
        hp: 3,
        abilities: [
          {
            text: "⤵ → Deal 3 damage to a unit or building. ◎",
            prompt: "Choose a unit or building to damage",
            isActivatedAbility: true,
            costsExhaustSelf: true,
            hasTargetSymbol: true,
            targetMode: targetMode.single,
            targetTypes: [types.unit, types.building],
            action: ({ state, source, choices }) => {
              queueDamage(state, {
                amount: 3,
                sourceId: source.id,
                subjectId: choices.targetId,
                isAbilityDamage: true
              });
            }
          }
        ]
      }
    ]
  }
};

export default redHeroCardInfo;
