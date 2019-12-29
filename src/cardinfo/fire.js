import { specs, colors, types, targetMode } from "./constants";
import { queueDamage } from "../damage";
import { longRange } from "./abilities/keywords";

const fireCardInfo = {
  fire_dart: {
    color: colors.red,
    spec: specs.fire,
    name: "Fire Dart",
    type: types.spell,
    cost: 2,
    abilities: [
      {
        text: "Deal 3 damage to a unit or 2 damage to a building.",
        prompt: "Choose a unit or building to damage",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit, types.building],
        action: ({ state, choices }) => {
          const target = state.entities[choices.targetId];
          const amount = target.type == types.unit ? 3 : 2;
          queueDamage(state, {
            amount,
            subjectId: target.id,
            isSpellDamage: true
          });
        }
      }
    ]
  },
  doubleshot_archer: {
    color: colors.red,
    tech: 2,
    spec: specs.fire,
    name: "Doubleshot Archer",
    type: types.unit,
    subtypes: ["Soldier"],
    cost: 3,
    attack: 4,
    hp: 3,
    abilities: [
      longRange,
      {
        text: "Attacks: Deal 3 damage to that opponent's base.",
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
            amount: 3,
            sourceId: source.id,
            subjectId: base.id,
            isAbilityDamage: true
          });
        }
      }
    ]
  }
};

export default fireCardInfo;
