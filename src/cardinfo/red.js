import { colors, types, targetMode } from "./constants";
import { queueDamage } from "../entities";

const redCardInfo = {
  scorch: {
    color: colors.red,
    name: "Scorch",
    type: types.spell,
    minor: true,
    subtypes: ["Burn"],
    cost: 3,
    abilities: [
      {
        text: "Deal 2 damage to a patroller or building.",
        prompt: "Choose a patroller or building to damage",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit, types.building],
        canTarget: ({ state, target }) =>
          target.current.type == types.building ||
          state.players[target.current.controller].patrollerIds.includes(
            target.id
          ),
        action: ({ state, choices }) => {
          queueDamage(state, {
            amount: 2,
            subjectId: choices.targetId,
            isSpellDamage: true
          });
        }
      }
    ]
  }
};

export default redCardInfo;
