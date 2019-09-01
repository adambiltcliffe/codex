/**
 * Suggestions are exhaustive except for the following action types:
 * endTurn - only one set of possible patrollers is generated
 * choice with targetMode.multiple - currently not handled
 * choice with targetMode.codex - a few options are generated, at least one valid
 * choice with targetMode.obliterate - currently not handled
 */

import { getAP } from "./util";
import {
  getLegalChoicesForCurrentTrigger,
  currentStepDefinition
} from "./triggers";
import { getCurrentValues } from "./entities";
import { types, specs, targetMode } from "./cardinfo/constants";
import { emptyPatrolZone } from "./patrolzone";
import BaseCodexGame from "./game";

import flatMap from "lodash/flatMap";
import flatten from "lodash/flatten";
import map from "lodash/map";
import partition from "lodash/partition";
import range from "lodash/range";
import slice from "lodash/slice";
import take from "lodash/take";
import uniq from "lodash/uniq";
import { fixtureNames } from "./fixtures";
import { wrapSecrets } from "./targets";

export default function suggestActions(state) {
  if (!state.started) {
    return [
      {
        type: "start",
        specs: {
          [state.playerList[0]]: [specs.bashing],
          [state.playerList[1]]: [specs.finesse]
        }
      }
    ];
  }
  const candidateActions =
    state.newTriggers.length > 0
      ? getQueueCandidates(state)
      : state.currentTrigger
      ? getChoiceCandidates(state)
      : getMainPhaseCandidates(state);
  // filter them here
  return candidateActions.filter(a => {
    try {
      const x = BaseCodexGame.checkAction(state, a);
      if (x === undefined) {
        console.log(a);
      }
      return true;
    } catch (error) {
      return false;
    }
  });
}

function getQueueCandidates(state) {
  return range(state.newTriggers.length).map(n => ({
    type: "queue",
    index: n
  }));
}

function getChoiceCandidates(state) {
  const ap = getAP(state);
  switch (currentStepDefinition(state).targetMode) {
    case targetMode.single:
    case targetMode.modal: {
      return getLegalChoicesForCurrentTrigger(state).map(c => ({
        type: "choice",
        target: c
      }));
    }
    case targetMode.multiple: {
      return [];
    }
    case targetMode.obliterate: {
      return [];
    }
    case targetMode.codex: {
      const realIndexList = flatMap(ap.codex, ({ card, n }, ix) =>
        Array(n).fill(ix)
      );
      console.log(realIndexList);
      const realInds = [
        [],
        take(realIndexList, 1),
        take(realIndexList, 2),
        slice(realIndexList, 1, 3),
        slice(realIndexList, 2, 4)
      ];
      return realInds.map(is => ({
        type: "choice",
        indices: wrapSecrets(state, ap.id, is, ap.codex.length)
      }));
    }
  }
}

function getMainPhaseCandidates(state) {
  const ap = getAP(state);
  const base = [{ type: "endTurn" }];
  const workerActions = range(ap.hand.length).map(n => ({
    type: "worker",
    handIndex: n
  }));
  const playActions = uniq(ap.hand).map(c => ({ type: "play", card: c }));
  const summonActions = uniq(ap.commandZone).map(h => ({
    type: "summon",
    hero: h
  }));
  const [apUnits, napUnits] = partition(
    state.entities,
    u => u.current.controller == ap.id
  );
  const attackActions = flatten(
    apUnits
      .filter(a => a.current.type == types.unit || a.current.type == types.hero)
      .map(a => napUnits.map(b => [a.id, b.id]))
  ).map(([a, b]) => ({ type: "attack", attacker: a, target: b }));
  const examplePatrollers = take(
    apUnits
      .filter(e => e.current.type == types.unit || e.current.type == types.hero)
      .map(u => u.id)
      .concat(emptyPatrolZone),
    5
  );
  const examplePatrolAction = [
    { type: "endTurn", patrollers: examplePatrollers }
  ];
  const apUnitVals = getCurrentValues(state, apUnits.map(u => u.id));
  const activateActions = flatMap(apUnits, u =>
    apUnitVals[u.id].abilities.reduce(
      (acc, a, index) =>
        a.isActivatedAbility ? acc.concat([[u.id, index]]) : acc,
      []
    )
  ).map(([e, index]) => ({ type: "activate", source: e, index }));
  const levelActions = flatMap(
    Object.entries(apUnitVals).filter(([_k, v]) => v.type == types.hero),
    ([id, hv]) =>
      range(1, 1 + hv.maxbandLevel - state.entities[id].level).map(n => ({
        type: "level",
        hero: id,
        amount: n
      }))
  );
  const buildActions = map(fixtureNames, n => ({ type: "build", fixture: n }));
  return base
    .concat(examplePatrolAction)
    .concat(workerActions)
    .concat(playActions)
    .concat(summonActions)
    .concat(levelActions)
    .concat(attackActions)
    .concat(activateActions)
    .concat(buildActions);
}
