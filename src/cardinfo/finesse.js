import log from "../log";
import { types, colors, specs, targetMode } from "./constants";
import { conferComplexAbility, conferKeyword, damageEntity } from "../entities";
import {
  haste,
  flying,
  invisible,
  swiftStrike,
  antiAir
} from "./abilities/keywords";
import { getAP, andJoinVerb } from "../util";

import forEach from "lodash/forEach";
import { attachEffectThisTurn } from "../effects";
import { isPatrolling, sideline } from "../patrolzone";
import { drawCards } from "../draw";

const finesseCardInfo = {
  discord: {
    color: colors.neutral,
    spec: specs.finesse,
    name: "Discord",
    type: types.spell,
    subtypes: ["Debuff"],
    cost: 2,
    abilities: [
      {
        isSpellEffect: true,
        action: ({ state, choices }) => {
          const names = [];
          forEach(state.entities, e => {
            if (
              e.current.type == types.unit &&
              e.current.controller != getAP(state).id &&
              e.current.tech < 2
            ) {
              attachEffectThisTurn(state, e, {
                path: "cardInfo.discord.createdEffect"
              });
              names.push(e.current.name);
            }
          });
          if (names.length > 0) {
            log.add(
              state,
              `${andJoinVerb(names, "gets", "get")} -2/-1 this turn.`
            );
          } else {
            log.add(state, "No units were affected.");
          }
        }
      }
    ],
    createdEffect: {
      modifySubjectValues: ({ subject }) => {
        subject.current.attack -= 2;
        subject.current.hp -= 1;
      }
    }
  },
  appel_stomp: {
    color: colors.neutral,
    spec: specs.finesse,
    name: "Appel Stomp",
    type: types.spell,
    ultimate: true,
    subtypes: ["Debuff"],
    cost: 1,
    abilities: [
      {
        isSpellEffect: true,
        steps: [
          {
            prompt: "Choose a patroller to sideline",
            hasTargetSymbol: true,
            targetMode: targetMode.single,
            targetTypes: [types.unit, types.hero],
            canTarget: ({ state, target }) => isPatrolling(state, target),
            action: ({ state, choices }) => {
              const target = state.entities[choices.targetId];
              sideline(state, target);
              log.add(state, `${target.current.name} is sidelined.`);
            }
          },
          {
            action: ({ state }) => {
              drawCards(state, getAP(state).id, 1, " from Appel Stomp");
            }
          },
          {
            prompt: "Choose where to put Appel Stomp",
            targetMode: targetMode.modal,
            options: ["On top of your draw pile", "In your discard pile"],
            action: ({ state, choices }) => {
              const ap = getAP(state);
              if (choices.index == 0) {
                log.add(
                  state,
                  log.fmt`${ap} puts Appel Stomp on top of their draw pile.`
                );
                state.updateHidden(fs => {
                  fs.players[ap.id].deck.unshift(fs.playedCard);
                });
                delete state.playedCard;
              } else {
                log.add(
                  state,
                  log.fmt`${ap} puts Appel Stomp in their discard.`
                );
              }
            }
          }
        ]
      }
    ]
  },
  nimble_fencer: {
    color: colors.neutral,
    tech: 1,
    spec: specs.finesse,
    name: "Nimble Fencer",
    type: types.unit,
    subtypes: ["Virtuoso"],
    cost: 2,
    attack: 2,
    hp: 3,
    abilities: [
      {
        modifyGlobalValues: ({ self, other }) => {
          if (self.current.controller == other.current.controller) {
            if (other.current.subtypes.includes("Virtuoso")) {
              conferKeyword(other, haste);
            }
          }
        }
      }
    ]
  },

  starcrossed_starlet: {
    color: colors.neutral,
    tech: 1,
    spec: specs.finesse,
    name: "Star-Crossed Starlet",
    type: types.unit,
    subtypes: ["Virtuoso"],
    cost: 2,
    attack: 3,
    hp: 2,
    abilities: [
      {
        triggerOnUpkeep: true,
        action: ({ state, source }) => {
          damageEntity(state, source, {
            amount: 1,
            source,
            isAbilityDamage: true
          });
        }
      },
      {
        modifyOwnValues: ({ self }) => {
          self.current.attack += self.damage;
        }
      }
    ]
  },
  grounded_guide: {
    color: colors.neutral,
    tech: 2,
    spec: specs.finesse,
    name: "Grounded Guide",
    type: types.unit,
    subtypes: ["Thespian"],
    cost: 5,
    attack: 4,
    hp: 4,
    abilities: [
      {
        modifyGlobalValues: ({ self, other }) => {
          if (
            self.current.controller == other.current.controller &&
            self.id != other.id
          ) {
            if (other.current.subtypes.includes("Virtuoso")) {
              other.current.attack += 2;
              other.current.hp += 1;
            } else {
              other.current.attack += 1;
            }
          }
        }
      }
    ]
  },
  maestro: {
    color: colors.neutral,
    tech: 2,
    spec: specs.finesse,
    name: "Maestro",
    type: types.unit,
    subtypes: ["Thespian"],
    cost: 3,
    attack: 3,
    hp: 5,
    abilities: [
      {
        modifyGlobalValues: ({ state, self, other }) => {
          if (self.current.controller == other.current.controller) {
            if (other.current.subtypes.includes("Virtuoso")) {
              conferComplexAbility(other, "cardInfo.maestro.conferredAbility");
            }
          }
        },
        modifyPlayCost({ state, sourceVals, cardInfo, currentCost }) {
          if (getAP(state).id == sourceVals.controller) {
            if ((cardInfo.subtypes || []).includes("Virtuoso")) {
              return 0;
            }
          }
          return currentCost;
        }
      }
    ],
    conferredAbility: {
      prompt: "Choose a building to damage",
      isActivatedAbility: true,
      costsExhaustSelf: true,
      hasTargetSymbol: true,
      targetMode: targetMode.single,
      targetTypes: [types.building],
      action: ({ state, source, choices }) => {
        damageEntity(state, state.entities[choices.targetId], {
          amount: 2,
          source,
          isAbilityDamage: true
        });
      }
    }
  },
  backstabber: {
    color: colors.neutral,
    tech: 2,
    spec: specs.finesse,
    name: "Backstabber",
    type: types.unit,
    subtypes: ["Rogue"],
    cost: 3,
    attack: 3,
    hp: 3,
    abilities: [invisible]
  },
  cloud_sprite: {
    color: colors.neutral,
    tech: 2,
    spec: specs.finesse,
    name: "Cloud Sprite",
    type: types.unit,
    subtypes: ["Fairy"],
    cost: 2,
    attack: 3,
    hp: 2,
    abilities: [flying]
  },
  leaping_lizard: {
    color: colors.neutral,
    tech: 2,
    spec: specs.finesse,
    name: "Leaping Lizard",
    type: types.unit,
    subtypes: ["Lizardman"],
    cost: 1,
    attack: 3,
    hp: 5,
    abilities: [antiAir]
  },
  blademaster: {
    color: colors.neutral,
    tech: 3,
    spec: specs.finesse,
    name: "Blademaster",
    type: types.unit,
    subtypes: ["Virtuoso"],
    cost: 6,
    attack: 7,
    hp: 5,
    abilities: [
      {
        modifyGlobalValues: ({ state, self, other }) => {
          if (
            self.current.controller == other.current.controller &&
            (other.current.type == types.unit ||
              other.current.type == types.hero)
          ) {
            conferKeyword(other, swiftStrike);
          }
        }
      }
    ]
  }
};

export default finesseCardInfo;
