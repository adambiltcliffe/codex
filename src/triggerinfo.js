import log from "./log";
import { givePlayerGold } from "./util";
import { drawCards } from "./draw";

const triggerInfo = {
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
  }
};

export default triggerInfo;
