import log from "../log";
import { specs, colors, types } from "./constants";
import { sparkshot, antiAir, resist, overpower } from "./abilities/keywords";

const feralCardInfo = {
  huntress: {
    color: colors.green,
    tech: 1,
    spec: specs.feral,
    name: "Huntress",
    type: types.unit,
    subtypes: ["Centaur"],
    cost: 2,
    attack: 3,
    hp: 3,
    abilities: [sparkshot, antiAir]
  },
  barkcoat_bear: {
    color: colors.green,
    tech: 2,
    spec: specs.feral,
    name: "Barkcoat Bear",
    type: types.unit,
    subtypes: ["Bear"],
    cost: 4,
    attack: 5,
    hp: 5,
    abilities: [resist(2), overpower]
  },
  rampaging_elephant: {
    color: colors.green,
    tech: 2,
    spec: specs.feral,
    name: "Rampaging Elephant",
    type: types.unit,
    subtypes: ["Elephant"],
    cost: 6,
    attack: 6,
    hp: 7,
    abilities: [
      {
        text:
          "The first time Rampaging Elephant exhausts each turn, ready him.",
        triggerOnExhaust: true,
        shouldTrigger: ({ state, source, cardInfo }) =>
          !source.thisTurn.elephantReadied,
        action: ({ state, source }) => {
          source.thisTurn.elephantReadied = true;
          source.ready = true;
          log.add(state, `${source.current.name} readies itself!`);
        }
      }
    ]
  }
};

export default feralCardInfo;
