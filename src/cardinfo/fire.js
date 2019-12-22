import { specs, colors, types, targetMode } from "./constants";
import { queueDamage } from "../damage";

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
  }
};

export default fireCardInfo;
