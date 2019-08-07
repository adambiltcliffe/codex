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
