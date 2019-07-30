import log from "../log";
import { types, colors, specs, targetMode } from "./constants";
import {
  conferComplexAbility,
  conferKeyword,
  getName,
  getCurrentController
} from "../entities";
import { haste, flying, invisible } from "./abilities/keywords";

const finesseCardInfo = {
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
        modifyGlobalValues: ({ state, source, values }) => {
          if (getCurrentController(state, source.id) == values.controller) {
            if (values.subtypes.includes("Virtuoso")) {
              conferKeyword(values, haste);
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
          source.damage++;
          log.add(state, `${getName(state, source.id)} takes 1 damage.`);
        }
      },
      {
        modifyOwnValues: ({ state, self, values }) => {
          values.attack += state.entities[self.id].damage;
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
        modifyGlobalValues: ({ state, source, subject, values }) => {
          if (
            getCurrentController(state, source.id) == values.controller &&
            source.id != subject.id
          ) {
            if (values.subtypes.includes("Virtuoso")) {
              values.attack += 2;
              values.hp += 1;
            } else {
              values.attack += 1;
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
        modifyGlobalValues: ({ state, source, values }) => {
          if (getCurrentController(state, source.id) == values.controller) {
            if (values.subtypes.includes("Virtuoso")) {
              conferComplexAbility(values, "maestro.conferredAbility");
            }
          }
        }
      }
    ],
    conferredAbility: {
      isActivatedAbility: true,
      costsExhaustSelf: true,
      targetMode: targetMode.single,
      targetTypes: [types.building],
      action: ({ state, source, choices }) => {
        state.entities[choices.targetId].damage += 2;
        log.add(
          state,
          `${getName(state, source.id)} deals 2 damage to ${getName(
            state,
            choices.targetId
          )}.`
        );
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
  }
};

export default finesseCardInfo;
