import { colors, types, specs, targetMode } from "./constants";
import { sparkshot } from "./abilities/keywords";
import log from "../log";
import { damageEntity } from "../entities";

const fireHeroCardInfo = {
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
              damageEntity(state, state.entities[choices.targetId], {
                amount: 1,
                source,
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
              damageEntity(state, state.entities[choices.targetId], {
                amount: 3,
                source,
                isAbilityDamage: true
              });
            }
          }
        ]
      }
    ]
  }
};

export default fireHeroCardInfo;
