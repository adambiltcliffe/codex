import Game from "board-state";
import { checkStartAction, doStartAction } from "./actions";

class CodexGame extends Game {
  static getFilters(state) {
    return Object.assign(
      {},
      ...state.playerList.map(k => ({
        [k]: s => {
          if (!s.started) {
            return;
          }
          for (const p in s.players) {
            s.players[p].handCount = s.players[p].hand.length;
            s.players[p].deckCount = s.players[p].deck.length;
            delete s.players[p].deck;
            if (p != k) {
              delete s.players[p].hand;
            }
          }
        }
      }))
    );
  }
  static updateState(state, action) {
    state.updateHidden = t => {
      this.applyUpdate.bind(this)(state, t);
    };
    if (action.type == "start") {
      doStartAction(state, action);
    }
    delete state.updateHidden;
  }
  static checkAction(state, action) {
    if (typeof action != "object") {
      throw new Error("Action was not an object");
    }
    if (!state.started && action.type != "start") {
      throw new Error("Game not started");
    }
    switch (action.type) {
      case "start":
        return checkStartAction(state, action);
      default:
        throw new Error("Unrecognised action type");
    }
  }
  static suggestActions(state) {
    if (!state.started) {
      return [{ type: "start" }];
    }
    return [];
  }
}

export default CodexGame;
