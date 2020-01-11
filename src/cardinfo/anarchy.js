import { colors, types, specs } from "./constants";
import {
  longRange,
  resist,
  flying,
  haste,
  obliterate,
  antiAir,
  ephemeral
} from "./abilities/keywords";
import { getAP } from "../util";
import log from "../log";
import { putEntityIntoPlay } from "../actions/play";
import { killEntity } from "../entities";

const anarchyCardInfo = {
  surprise_attack: {
    color: colors.red,
    spec: specs.anarchy,
    name: "Surprise Attack",
    type: types.spell,
    subtypes: ["Summon"],
    cost: 5,
    abilities: [
      {
        text: "Summon two 3/1 blue Shark tokens with haste and ephemeral.",
        isSpellEffect: true,
        action: ({ state }) => {
          const ap = getAP(state);
          putEntityIntoPlay(state, ap.id, "shark_token");
          putEntityIntoPlay(state, ap.id, "shark_token");
          log.add(state, "Surprise Attack creates two Shark tokens.");
        }
      }
    ]
  },
  maximum_anarchy: {
    color: colors.red,
    spec: specs.anarchy,
    name: "Maximum Anarchy",
    type: types.spell,
    ultimate: true,
    cost: 3,
    abilities: [
      {
        text: "Destroy all units and heroes.",
        isSpellEffect: true,
        action: ({ state }) => {
          const ids = Object.values(state.entities)
            .filter(
              e => e.current.type == types.unit || e.current.type == types.hero
            )
            .map(e => e.id);
          ids.forEach(id => killEntity(state, id));
        }
      }
    ]
  },
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
  },
  shark_token: {
    token: true,
    color: colors.blue,
    tech: 0,
    name: "Shark",
    type: types.unit,
    attack: 3,
    hp: 1,
    abilities: [haste, ephemeral]
  }
};

export default anarchyCardInfo;
