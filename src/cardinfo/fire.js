import { specs, colors, types, targetMode } from "./constants";

const fireCardInfo = {
  fire_dart: {
    color: colors.red,
    spec: specs.fire,
    name: "Fire Dart",
    type: types.spell,
    cost: 2,
    abilities: [
      {
        prompt: "Choose a unit or building to damage",
        isSpellEffect: true,
        hasTargetSymbol: true,
        targetMode: targetMode.single,
        targetTypes: [types.unit, types.building],
        action: ({ state, choices }) => {
          const target = state.entities[choices.targetId];
          const amount = target.type == types.unit ? 3 : 2;
          target.damage += amount;
          log.add(
            state,
            `Fire Dart deals ${amount} damage to ${getName(
              state,
              choices.targetId
            )}.`
          );
        }
      }
    ]
  }
};

export default fireCardInfo;
