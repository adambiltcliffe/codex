import { colors, types, specs } from "./constants";
import {
  longRange,
  resist,
  flying,
  haste,
  obliterate,
  antiAir
} from "./abilities/keywords";
import { getAP } from "../util";
import log from "../log";

const anarchyCardInfo = {
  gunpoint_taxman: {
    color: colors.red,
    tech: 1,
    spec: specs.anarchy,
    name: "Gunpoint Taxman",
    type: types.unit,
    subtypes: ["Pirate"],
    cost: 2,
    attack: 3,
    hp: 3,
    abilities: [
      antiAir,
      {
        text:
          "Whenever Gunpoint Taxman kills a patroller, steal ① from that player.",
        triggerOnDamageEntity: true,
        shouldTrigger: ({ state, packet, isLethal }) => {
          return (
            isLethal &&
            state.entities[packet.subjectId].current.patrolSlot !== null
          );
        },
        action: ({ state }) => {
          const ap = getAP(state);
          const dpId = state.currentTrigger.subjectController;
          const dp = state.players[dpId];
          if (dp.gold > 0) {
            ap.gold += 1;
            dp.gold -= 1;
            log.add(state, log.fmt`${ap} steals 1 gold from ${dp}.`);
          }
        }
      }
    ]
  },

  pirate_gunship: {
    color: colors.red,
    tech: 3,
    spec: specs.anarchy,
    name: "Pirate Gunship",
    type: types.unit,
    subtypes: ["Contraption", "Airship"],
    cost: 6,
    attack: 7,
    hp: 6,
    abilities: [flying, haste, longRange, resist(2), obliterate(2)]
  }
};

export default anarchyCardInfo;
