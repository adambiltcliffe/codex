import { frenzy, readiness, sparkshot } from "./abilities/keywords";
import { colors, specs, types } from "./constants";
import { putEntityIntoPlay } from "../actions/play";
import log from "../log";

const blueHeroCardInfo = {
  general_onimaru: {
    color: colors.blue,
    spec: specs.peace,
    name: "General Onimaru",
    title: "Wartime Strategist",
    type: types.hero,
    cost: 2,
    midbandLevel: 5,
    maxbandLevel: 8,
    bands: [
      { attack: 2, hp: 3, abilities: [frenzy(1)] },
      {
        attack: 3,
        hp: 4,
        abilities: [readiness]
      },
      {
        attack: 4,
        hp: 5,
        abilities: [
          {
            text:
              "Max Level: Summon three 1/1 blue soldier tokens with sparkshot.",
            triggerOnMaxLevel: true,
            action: ({ state, source }) => {
              for (let ii = 0; ii < 3; ii++) {
                putEntityIntoPlay(
                  state,
                  source.current.controller,
                  "soldier_token"
                );
              }
              log.add(
                state,
                `${source.current.name} creates three Soldier tokens.`
              );
            }
          }
        ]
      }
    ]
  },
  soldier_token: {
    token: true,
    color: colors.blue,
    tech: 0,
    name: "Soldier",
    type: types.unit,
    attack: 1,
    hp: 1,
    abilities: [sparkshot]
  }
};

export default blueHeroCardInfo;
