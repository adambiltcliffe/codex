import { colors, types, specs, targetMode } from "./constants";
import { fixtureNames } from "../fixtures";
import { readiness } from "./abilities/keywords";
import log from "../log";

import find from "lodash/find";
import { sideline } from "../patrolzone";
import { queueDamage } from "../entities";
import { getAP } from "../util";

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
            text: "Attacks: Deal 1 damage to that opponent's base.",
            triggerOnAttack: true,
            action: ({ state, source }) => {
              const defendingPlayer =
                state.entities[state.currentAttack.target].current.controller;
              const base = find(
                Object.entries(state.entities),
                ([id, e]) =>
                  e.fixture == fixtureNames.base && e.owner == defendingPlayer
              )[1];
              queueDamage(state, {
                amount: 1,
                sourceId: source.id,
                subjectId: base.id,
                isAbilityDamage: true
              });
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
        abilities: [
          {
            text:
              "⤵ → Sideline a tech 0 or tech I patroller. (Move it out of the patrol zone.) ◎",
            prompt: "Choose a tech 0 or tech 1 patroller to sideline",
            isActivatedAbility: true,
            costsExhaustSelf: true,
            hasTargetSymbol: true,
            targetMode: targetMode.single,
            targetTypes: [types.unit, types.hero],
            canTarget: ({ target }) =>
              target.current.tech < 2 && target.current.patrolSlot !== null,
            action: ({ state, source, choices }) => {
              const target = state.entities[choices.targetId];
              sideline(state, target);
              log.add(state, `${target.current.name} is sidelined.`);
            }
          }
        ]
      },
      {
        attack: 3,
        hp: 4,
        abilities: [
          {
            text: "Your tech 0 units cost ① less to play.",
            modifyPlayCost({ state, sourceVals, cardInfo, currentCost }) {
              if (getAP(state).id == sourceVals.controller) {
                if (cardInfo.type == types.unit && cardInfo.tech == 0) {
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
