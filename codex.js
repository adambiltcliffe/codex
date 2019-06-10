import Game from "board-state";
import * as actions from "./actions";
import { getAP } from "./util";

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
            s.players[p].discardCount = s.players[p].discard.length;
            delete s.players[p].deck;
            if (p != k) {
              delete s.players[p].hand;
              delete s.players[p].discard;
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
    switch (action.type) {
      case "start":
        actions.doStartAction(state, action);
        break;
      case "worker":
        actions.doWorkerAction(state, action);
        break;
      case "play":
        actions.doPlayAction(state, action);
        break;
      case "endTurn":
        actions.doEndTurnAction(state, action);
        break;
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
        return actions.checkStartAction(state, action);
      case "worker":
        return actions.checkWorkerAction(state, action);
      case "play":
        return actions.checkPlayAction(state, action);
      case "endTurn":
        return actions.checkEndTurnAction(state, action);
      default:
        throw new Error("Unrecognised action type");
    }
  }
  static suggestActions(state) {
    if (!state.started) {
      return [{ type: "start" }];
    }
    const ap = getAP(state);
    const base = [{ type: "endTurn" }];
    const workerActions = Array.from(Array(ap.hand.length).keys()).map(n => ({
      type: "worker",
      handIndex: n
    }));
    const playActions = ap.hand.map(c => ({ type: "play", card: c }));
    return base.concat(workerActions).concat(playActions);
  }
}

export default CodexGame;
