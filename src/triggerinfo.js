import log from "./log";
import { givePlayerGold } from "./util";

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
      const player = state.players[state.currentTrigger.playerId];
      log.add(
        state,
        log.fmt`${player} fails to draw a card from death of technician as it's not implemented.`
      );
    }
  }
};

export default triggerInfo;
