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
    // Run the simulation until we can't continue without a player acting
    while (!state.result) {
      // If there's only one new trigger, enqueue it and then carry on
      if (state.newTriggers.length == 1) {
        addTriggerToQueue(state, state.newTriggers.shift());
        continue;
      }
      // If there are multiple new triggers, stop and wait for the player to queue one
      else if (state.newTriggers.length > 0) {
        break;
      }
      // Now we know there are no new triggers
      // If there is a current trigger, resolve it if possible
      else if (state.currentTrigger && canResolveCurrentTrigger(state)) {
        resolveCurrentTrigger(state);
        continue;
      }
      // If we couldn't resolve it, wait for the user to make a choice
      else if (state.currentTrigger) {
        break;
      }
      // Now we know there are no current triggers
      // If the queue isn't empty, queue the next item from it
      else if (state.queue.length > 0) {
        enqueueNextTrigger(state);
        continue;
      }
      // Now we know there are no triggers resolving, queued or floating
      if (state.phase != phases.main) {
        advancePhase(state);
        continue;
      }
      if (state.currentAttack != null) {
        enqueueResolveAttack(state);
        continue;
      }
      // We are in the main phase and nothing is going on so wait for an action
      break;
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
    if (action.type == "queue") {
      return actions.checkQueueAction(state, action);
    }
    if (state.currentTrigger && action.type != "choice") {
      throw new Error(
        "Must finish making choices for the current trigger first"
      );
    }
    switch (action.type) {
      case "start":
        return actions.checkStartAction(state, action);
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
