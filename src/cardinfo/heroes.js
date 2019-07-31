import { colors, types } from "./constants";
import { readiness } from "./abilities/keywords";
import log from "../log";
import { getName, getCurrentController } from "../entities";

import find from "lodash/find";
import { fixtureNames } from "../fixtures";

const heroCardInfo = {
  troq_bashar: {
    color: colors.neutral,
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
                `${getName(state, source.id)} deals 1 damage to ${getName(
                  state,
                  base.id
                )}.`
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
