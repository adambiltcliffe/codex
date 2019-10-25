import { colors, types, targetMode } from "./constants";

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
          damageEntity(state, state.entities[choices.targetId], {
            amount: 2,
            isSpellDamage: true
          });
        }
      }
    ]
  }
};

export default redCardInfo;
