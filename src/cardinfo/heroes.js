import { colors, types, specs, targetMode } from "./constants";
import { readiness, sparkshot } from "./abilities/keywords";
import log from "../log";
import { getName, getCurrentController } from "../entities";

import find from "lodash/find";
import { fixtureNames } from "../fixtures";

const heroCardInfo = {
  jaina_stormborne: {
    color: colors.red,
    spec: specs.fire,
    name: "Jaine Stormborne",
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
            canTarget: ({ state, targetId }) =>
              getCurrentValues(state, state.entities[targetId]).type ==
                types.building ||
              state.players[
                getCurrentController(state, targetId)
              ].patrollerIds.includes(targetId),
            action: ({ state, source, choices }) => {
              state.entities[choices.targetId].damage += 1;
              log.add(
                state,
                `${getName(state, source.id)} deals 1 damage to ${getName(
                  state,
                  choices.targetId
                )}.`
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
      }
    ]
  },
  troq_bashar: {
    color: colors.neutral,
    spec: specs.bashing,
    name: "Troq Bashar",
    title: "Renegade Beast",
    type: types.hero,
    cost: 2,
    midbandLevel: 5,
    maxbandLevel: 8,
    bands: [
      { attack: 2, hp: 3 },
      {
        attack: 3,
        hp: 4,
        abilities: [
          {
            triggerOnAttack: true,
            action: ({ state, source }) => {
              const defendingPlayer = getCurrentController(
                state,
                state.currentAttack.target
              );
              const base = find(
                Object.entries(state.entities),
                ([id, e]) =>
                  e.fixture == fixtureNames.base && e.owner == defendingPlayer
              )[1];
              base.damage += 1;
              log.add(
                state,
                `${source.current.name} deals 1 damage to ${
                  state.entities[base.id].current.name
                }.`
              );
            }
          }
        ]
      },
      { attack: 4, hp: 5, abilities: [readiness] }
    ]
  }
};

export default heroCardInfo;
