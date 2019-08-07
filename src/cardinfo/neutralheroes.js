import { colors, types, specs } from "./constants";
import { fixtureNames } from "../fixtures";
import { readiness } from "./abilities/keywords";
import log from "../log";

import find from "lodash/find";

const neutralHeroCardInfo = {
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
              const defendingPlayer =
                state.entities[state.currentAttack.target].current.controller;
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
  },
  river_montoya: {
    color: colors.neutral,
    spec: specs.finesse,
    name: "River Montoya",
    title: "Dancing Fencer",
    type: types.hero,
    cost: 2,
    midbandLevel: 3,
    maxbandLevel: 5,
    bands: [
      { attack: 2, hp: 3 },
      {
        attack: 2,
        hp: 4,
        abilities: []
      },
      {
        attack: 3,
        hp: 4,
        abilities: [
          {
            modifyPlayCost({ state, sourceVals, cardInfo, currentCost }) {
              if (getAP(state).id == sourceVals.controller) {
                if (cardInfo.types == types.unit && cardInfo.tech == 0) {
                  return currentCost - 1;
                }
              }
              return currentCost;
            }
          }
        ]
      }
    ]
  }
};

export default neutralHeroCardInfo;
