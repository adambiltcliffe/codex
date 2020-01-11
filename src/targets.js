import {
  invisible,
  hasKeyword,
  flagbearer,
  sumKeyword,
  resist
} from "./cardinfo/abilities/keywords";
import { targetMode } from "./cardinfo/constants";
import { getAP } from "./util";
import { patrolSlots } from "./patrolzone";
import { getObliterateTargets } from "./cardinfo/abilities/obliterate";

import range from "lodash/range";
import some from "lodash/some";
import { fixtureNames } from "./fixtures";

export function wrapSecret(state, playerId, real, n) {
  return (((real + state.players[playerId].secret) % n) + n) % n;
}

export function unwrapSecret(state, playerId, code, n) {
  return (((code - state.players[playerId].secret) % n) + n) % n;
}

export function wrapSecrets(state, playerId, realArray, n) {
  let currentSecret = state.players[playerId].secret;
  const result = [];
  realArray.forEach(real => {
    result.push((((real + currentSecret) % n) + n) % n);
    currentSecret = Math.floor(currentSecret / n);
  });
  return result;
}

export function unwrapSecrets(state, playerId, codeArray, n) {
  let currentSecret = state.players[playerId].secret;
  const result = [];
  codeArray.forEach(code => {
    result.push((((code - currentSecret) % n) + n) % n);
    currentSecret = Math.floor(currentSecret / n);
  });
  return result;
}

export function resetSecret(state, playerId) {
  // call only from within updateHidden
  state.players[playerId].secret = Math.floor(Math.random() * 1000000);
}

export function getResistCost(state, entity) {
  const bonusResist =
    state.players[entity.current.controller].patrollerIds[
      patrolSlots.lookout
    ] == entity.id
      ? 1
      : 0;
  return sumKeyword(entity.current, resist) + bonusResist;
}

function stepCanTargetEntity(state, stepDef, target) {
  // can only target specified types
  if (!stepDef.targetTypes.includes(target.current.type)) {
    return false;
  }
  // check additional restrictions if there are any
  if (
    stepDef.canTarget &&
    !stepDef.canTarget({
      state,
      target,
      triggerInfo: state.currentTrigger
    })
  ) {
    return false;
  }
  if (stepDef.hasTargetSymbol) {
    // if it's an opponent's unit, check resist and invisible
    if (target.current.controller != getAP(state).id) {
      if (hasKeyword(target.current, invisible) && !target.thisTurn.detected) {
        const tower =
          state.entities[
            state.players[getAP(state).id].current.fixtures[fixtureNames.tower]
          ];
        if (!tower || tower.thisTurn.usedDetector) {
          return false;
        }
      }
      const resistCost = getResistCost(state, target);
      if (resistCost > getAP(state).gold) {
        return false;
      }
    }
  }
  // otherwise it's ok
  return true;
}

export function getLegalChoicesForStep(state, stepDef) {
  switch (stepDef.targetMode) {
    case targetMode.single: {
      let possibleTargets = Object.values(state.entities);
      if (stepDef.restrictTargets) {
        possibleTargets = stepDef.restrictTargets(state);
      }
      const targets = possibleTargets.filter(e =>
        stepCanTargetEntity(state, stepDef, e)
      );
      if (stepDef.hasTargetSymbol) {
        const flagbearers = targets.filter(e =>
          hasKeyword(e.current, flagbearer)
        );
        return (flagbearers.length > 0 ? flagbearers : targets).map(e => e.id);
      } else {
        return targets.map(e => e.id);
      }
    }
    case targetMode.multiple: {
      let possibleTargets = Object.values(state.entities);
      if (stepDef.restrictTargets) {
        possibleTargets = stepDef.restrictTargets(state);
      }
      return possibleTargets
        .filter(e => stepCanTargetEntity(state, stepDef, e))
        .map(e => e.id);
    }
    case targetMode.obliterate:
      const dpId = state.currentAttack.defendingPlayer;
      const [definitely, maybe] = getObliterateTargets(
        state,
        dpId,
        stepDef.targetCount
      );
      return maybe.map(e => e.id);
    case targetMode.modal:
      if (stepDef.getLegalOptions) {
        return stepDef.getLegalOptions({ state });
      }
      return range(stepDef.options.length);
    case targetMode.codex:
      const ap = getAP(state);
      return range(ap.codex.length).filter(k => ap.codex[k].n > 0);
  }
}

export function validateTargetCombination(state, legalIds, chosenIds) {
  // should also throw if can't afford resist, or would require multiple detectors
  const flagbearers = legalIds.filter(id =>
    hasKeyword(state.entities[id].current, flagbearer)
  );
  const choseFlagbearer = some(chosenIds, id =>
    hasKeyword(state.entities[id].current, flagbearer)
  );
  if (flagbearers.length > 0 && !choseFlagbearer) {
    throw new Error("Must target at least one flagbearer");
  }
  return true;
}
