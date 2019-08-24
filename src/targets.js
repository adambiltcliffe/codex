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
      if (hasKeyword(target.current, invisible)) {
        return false;
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
    case targetMode.single:
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
    case targetMode.obliterate:
      const dpId = state.currentAttack.defendingPlayer;
      const [definitely, maybe] = getObliterateTargets(
        state,
        dpId,
        stepDef.targetCount
      );
      return maybe.map(e => e.id);
    case targetMode.modal:
      return range(stepDef.options.length);
  }
}
