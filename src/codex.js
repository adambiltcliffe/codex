import Game from "board-state";
import * as actions from "./actions";
import { getAP } from "./util";
import log from "./log";
import { phases, advancePhase } from "./phases";
import {
  addTriggerToQueue,
  canResolveCurrentTrigger,
  currentTriggerDefinition
} from "./triggers";
import { checkState, getCurrentController } from "./entities";
import { targetMode } from "./cardinfo/constants";

import flatten from "lodash/flatten";
import fromPairs from "lodash/fromPairs";
import partition from "lodash/partition";
import range from "lodash/range";
import take from "lodash/take";
import uniq from "lodash/uniq";
import { emptyPatrolZone } from "./patrolzone";

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
      case "queue":
        actions.doQueueAction(state, action);
        break;
      case "choice":
        actions.doChoiceAction(state, action);
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

    // We stop the simulation when we can't continue without a player acting
    let needAction = false;
    while (needAction == false) {
      if (state.newTriggers.length == 1) {
        addTriggerToQueue(state, state.newTriggers.shift());
      }
      if (state.newTriggers.length > 0) {
        needAction = true;
        break;
      }
      if (state.currentTrigger == null && state.queue.length > 0) {
        state.currentTrigger = state.queue.shift();
        state.currentTrigger.choices = {};
      }
      if (state.currentTrigger) {
        if (canResolveCurrentTrigger(state)) {
          currentTriggerDefinition(state).triggerAction({
            state,
            source: state.entities[state.currentTrigger.sourceId],
            choices: state.currentTrigger.choices
          });
          state.currentTrigger = null;
          checkState(state);
        } else {
          // Can't resolve trigger without further choices
          needAction = true;
          break;
        }
      }
      // If we get this far, we dealt with the current trigger if there was one
      if (state.queue.length == 0) {
        if (state.phase == phases.main) {
          needAction = true;
        } else {
          advancePhase(state);
        }
      }
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
    if (state.newTriggers.length > 0) {
      return range(state.newTriggers.length).map(n => ({
        type: "queue",
        index: n
      }));
    }
    if (
      state.currentTrigger &&
      currentTriggerDefinition(state).targetMode == targetMode.single
    ) {
      return Object.keys(state.entities).map(id => ({
        type: "choice",
        targetId: id
      }));
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
    const entityControllers = getCurrentController(
      state,
      Object.keys(state.entities)
    );
    const [apUnits, napUnits] = partition(
      state.entities,
      u => entityControllers[u.id] == ap.id
    );
    const attackActions = flatten(
      apUnits.map(a => napUnits.map(b => [a.id, b.id]))
    ).map(([a, b]) => ({ type: "attack", attacker: a, target: b }));
    const examplePatrollers = take(
      apUnits.map(u => u.id).concat(emptyPatrolZone),
      5
    );
    const examplePatrolAction = [
      { type: "endTurn", patrollers: examplePatrollers }
    ];
    return base
      .concat(examplePatrolAction)
      .concat(workerActions)
      .concat(playActions)
      .concat(attackActions);
  }
}

export default CodexGame;
