import log from "./log";
import { givePlayerGold, getAP } from "./util";
import { drawCards } from "./draw";
import resolveAttackTriggers from "./resolveattack";
import { types, targetMode } from "./cardinfo";

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
  }
};

export default triggerInfo;
