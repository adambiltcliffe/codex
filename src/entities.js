import forEach from "lodash/forEach";
import cardInfo from "./cardinfo";
import log from "./log";

export function killUnits(state) {
  forEach(state.entities, u => {
    if (u.damage >= cardInfo[u.card].hp) {
      log.add(state, log.fmt`${cardInfo[u.card].name} dies.`);
      delete state.entities[u.id];
      state.updateHidden(fs => {
        fs.players[u.owner].discard.push(u.card);
      });
    }
  });
}
