import Game from "board-state";
import * as actions from "./actions";
import { getAP } from "./util";
import log from "./log";
import {
  phases,
  enterReadyPhase,
  enterUpkeepPhase,
  enterMainPhase
} from "./phases";

import flatten from "lodash/flatten";
import fromPairs from "lodash/fromPairs";
import partition from "lodash/partition";
import range from "lodash/range";
import uniq from "lodash/uniq";

class CodexGame extends Game {
  static getFilters(state) {
    return fromPairs(
      state.playerList.map(k => [
        k,
        s => {
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
      ])
    );
  }
  static updateState(state, action) {
    state.updateHidden = t => {
      this.applyUpdate.bind(this)(state, t);
    };
    log.clear(state);
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
      case "attack":
        actions.doAttackAction(state, action);
        break;
      case "endTurn":
        actions.doEndTurnAction(state, action);
        break;
    }
    if (state.phase == phases.ready) {
      enterUpkeepPhase(state);
    }
    if (state.phase == phases.upkeep) {
      enterMainPhase(state);
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
      case "attack":
        return actions.checkAttackAction(state, action);
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
    return this.suggestMainPhaseActions(state);
  }
  static suggestMainPhaseActions(state) {
    const ap = getAP(state);
    const base = [{ type: "endTurn" }];
    const workerActions = range(ap.hand.length).map(n => ({
      type: "worker",
      handIndex: n
    }));
    const playActions = uniq(ap.hand).map(c => ({ type: "play", card: c }));
    const [apUnits, napUnits] = partition(
      state.units,
      u => u.controller == ap.id
    );
    const attackActions = flatten(
      apUnits.map(a => napUnits.map(b => [a.id, b.id]))
    ).map(([a, b]) => ({ type: "attack", attacker: a, target: b }));
    return base
      .concat(workerActions)
      .concat(playActions)
      .concat(attackActions);
  }
}

export default CodexGame;
