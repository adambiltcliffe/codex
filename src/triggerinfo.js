import { types, targetMode } from "./cardinfo/constants";
import log from "./log";
import { givePlayerGold, getAP } from "./util";
import { drawCards } from "./draw";
import resolveAttackTriggers from "./resolveattack";

import sumBy from "lodash/sumBy";
import { resetSecret, unwrapSecrets } from "./targets";

const triggerInfo = {
  ...resolveAttackTriggers,
  scavenger: {
    action: ({ state }) => {
      const player = state.players[state.currentTrigger.playerId];
      const gained = givePlayerGold(state, player.id, 1);
      log.add(
        state,
        log.fmt`${player} gains ${gained} gold from death of scavenger.`
      );
    }
  },
  technician: {
    action: ({ state }) => {
      drawCards(
        state,
        state.currentTrigger.playerId,
        1,
        " from death of technician"
      );
    }
  },
  heroDeath: {
    prompt: "Choose a hero to gain 2 levels",
    hasTargetSymbol: false,
    targetMode: targetMode.single,
    targetTypes: [types.hero],
    canTarget: ({ state, target }) => {
      return (
        target.current.controller != state.currentTrigger.playerId &&
        target.level < target.current.maxbandLevel
      );
    },
    action: ({ state, choices }) => {
      const hero = state.entities[choices.targetId];
      const oldLevel = hero.level;
      hero.level += 2;
      if (hero.level > hero.current.maxbandLevel) {
        hero.level = hero.current.maxbandLevel;
      }
      const gain = hero.level - oldLevel;
      log.add(
        state,
        `${hero.current.name} gains ${gain} level${gain == 1 ? "" : "s"}.`
      );
    }
  },
  tech: {
    prompt: "Choose cards to tech",
    targetMode: targetMode.codex,
    cardCount: 2,
    mustFindFullAmount: state => {
      return getAP(state).mustTech;
    },
    shouldSkipChoice: state => {
      state.updateHidden(fs => {
        const ap = getAP(fs);
        ap.codexCount = sumBy(ap.codex, "n");
      });
      return getAP(state).codexCount == 0;
    },
    action: ({ state, choices }) => {
      if (choices.indices) {
        state.updateHidden(fs => {
          const ap = getAP(fs);
          let techedCards = 0;
          const realIndices = unwrapSecrets(
            fs,
            ap.id,
            choices.indices,
            ap.codex.length
          );
          realIndices.forEach(index => {
            ap.codex[index].n--;
            ap.discard.push(ap.codex[index].card);
            techedCards++;
          });
          fs.techResult = techedCards;
          resetSecret(fs, ap.id);
        });
        log.add(
          state,
          log.fmt`${getAP(state)} techs ${state.techResult} card${
            state.techResult == 1 ? "" : "s"
          }.`
        );
      }
    }
  }
};

export default triggerInfo;
