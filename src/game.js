import Game from "board-state";
import * as actions from "./actions";
import log from "./log";
import { phases, advancePhase } from "./phases";
import {
  addTriggerToQueue,
  canResolveCurrentTrigger,
  enqueueNextTrigger,
  resolveCurrentTrigger
} from "./triggers";
import { cacheCurrentValues } from "./entities";
import { enqueueResolveAttack } from "./resolveattack";

import fromPairs from "lodash/fromPairs";

class CodexGame extends Game {
  static getFilters(state) {
    const playerKeys = ["observer", ...state.playerList];
    return fromPairs(
      playerKeys.map(k => [
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
              delete s.players[p].codex;
              delete s.players[p].secret;
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
    cacheCurrentValues(state);
    switch (action.type) {
      case "start":
        actions.doStartAction(state, action);
        break;
      case "queue":
        actions.doQueueAction(state, action);
        break;
      case "choice":
        actions.doChoiceAction(state, action);
        break;
      case "worker":
        actions.doWorkerAction(state, action);
        break;
      case "build":
        actions.doBuildAction(state, action);
        break;
      case "play":
        actions.doPlayAction(state, action);
        break;
      case "summon":
        actions.doSummonAction(state, action);
        break;
      case "level":
        actions.doLevelAction(state, action);
        break;
      case "attack":
        actions.doAttackAction(state, action);
        break;
      case "activate":
        actions.doActivateAction(state, action);
        break;
      case "endTurn":
        actions.doEndTurnAction(state, action);
        break;
    }
    // We stop the simulation when we can't continue without a player acting
    let needAction = false;
    while (needAction == false && !state.result) {
      if (state.newTriggers.length == 1) {
        addTriggerToQueue(state, state.newTriggers.shift());
      }
      if (state.newTriggers.length > 0) {
        needAction = true;
        break;
      }
      if (state.currentTrigger == null && state.queue.length > 0) {
        enqueueNextTrigger(state);
      }
      while (state.currentTrigger) {
        if (canResolveCurrentTrigger(state)) {
          resolveCurrentTrigger(state);
        } else {
          // Can't resolve trigger without further choices
          needAction = true;
          break;
        }
      }
      if (needAction) {
        break;
      }
      // If we get this far, we dealt with the current trigger if there was one
      if (state.queue.length == 0) {
        if (state.phase == phases.main) {
          if (state.currentAttack == null) {
            if (state.newTriggers.length == 0) {
              needAction = true;
            }
          } else {
            enqueueResolveAttack(state);
          }
        } else {
          advancePhase(state);
        }
      }
    }
    // clearCurrentValues(state)
    delete state.updateHidden;
  }
  static checkAction(state, action) {
    if (state.result) {
      throw new Error("The game has ended");
    }
    if (typeof action != "object") {
      throw new Error("Action was not an object");
    }
    if (!state.started && action.type != "start") {
      throw new Error("Game not started");
    }
    if (
      state.newTriggers &&
      state.newTriggers.length > 0 &&
      action.type != "queue"
    ) {
      throw new Error("Must add new triggers to the queue first");
    }
    if (state.currentTrigger && action.type != "choice") {
      throw new Error(
        "Must finish making choices for the current trigger first"
      );
    }
    switch (action.type) {
      case "start":
        return actions.checkStartAction(state, action);
      case "queue":
        return actions.checkQueueAction(state, action);
      case "choice":
        return actions.checkChoiceAction(state, action);
      case "worker":
        return actions.checkWorkerAction(state, action);
      case "build":
        return actions.checkBuildAction(state, action);
      case "play":
        return actions.checkPlayAction(state, action);
      case "summon":
        return actions.checkSummonAction(state, action);
      case "level":
        return actions.checkLevelAction(state, action);
      case "attack":
        return actions.checkAttackAction(state, action);
      case "activate":
        return actions.checkActivateAction(state, action);
      case "endTurn":
        return actions.checkEndTurnAction(state, action);
      default:
        throw new Error("Unrecognised action type");
    }
  }
}

export default CodexGame;
