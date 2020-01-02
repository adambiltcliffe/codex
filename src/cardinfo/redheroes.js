import { colors, types, specs, targetMode } from "./constants";
import { sparkshot, haste } from "./abilities/keywords";
import { queueDamage } from "../damage";

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
        abilities: []
      },
      {
        attack: 4,
        hp: 4,
        abilities: []
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
