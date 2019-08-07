import { colors, types, specs, targetMode } from "./constants";
import { sparkshot } from "./abilities/keywords";
import log from "../log";

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
            prompt: "Choose a patrolling unit or building to damage",
            isActivatedAbility: true,
            costsExhaustSelf: true,
            targetMode: targetMode.single,
            targetTypes: [types.unit, types.building],
            canTarget: ({ state, target }) =>
              target.current.type == types.building ||
              state.players[target.current.controller].patrollerIds.includes(
                target.id
              ),
            action: ({ state, source, choices }) => {
              const target = state.entities[choices.targetId];
              target.damage += 1;
              log.add(
                state,
                `${source.current.name} deals 1 damage to ${
                  target.current.name
                }.`
              );
            }
          }
        ]
      },
      {
        attack: 4,
        hp: 3,
        abilities: [
          {
            prompt: "Choose a unit or building to damage",
            isActivatedAbility: true,
            costsExhaustSelf: true,
            targetMode: targetMode.single,
            targetTypes: [types.unit, types.building],
            action: ({ state, source, choices }) => {
              const target = state.entities[choices.targetId];
              target.damage += 3;
              log.add(
                state,
                `${source.current.name} deals 3 damage to ${
                  target.current.name
                }.`
              );
            }
          }
        ]
      }
    ]
  }
};

export default fireHeroCardInfo;
