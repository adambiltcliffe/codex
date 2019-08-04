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
        isSpellEffect: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit, types.building],
        canTarget: ({ state, targetId }) =>
          state.entities[targetId].type == types.building ||
          state.players[
            state.entities[targetId].controller
          ].patrollerIds.includes(targetId),
        action: ({ state, choices }) => {
          state.entities[choices.targetId].damage += 2;
          log.add(
            state,
            `Scorch deals 2 damage to ${getName(state, choices.targetId)}.`
          );
        }
      }
    ]
  }
};

export default redCardInfo;
