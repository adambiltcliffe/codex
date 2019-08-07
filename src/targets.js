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
import { getAttackableEntityIds } from "./actions/attack";

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
  // otherwise it's ok
  return true;
}

export function getLegalChoicesForStep(state, stepDef) {
  switch (stepDef.targetMode) {
    case targetMode.single:
      const targets = Object.values(state.entities).filter(e =>
        stepCanTargetEntity(state, stepDef, e)
      );
      const flagbearers = targets.filter(e =>
        hasKeyword(e.current, flagbearer)
      );
      return (flagbearers.length > 0 ? flagbearers : targets).map(e => e.id);
    case targetMode.overpower:
      return getAttackableEntityIds(
        state,
        state.entities[state.currentAttack.attacker].current
      ).filter(id => id != state.currentAttack.target);
    case targetMode.sparkshot:
      const result = [];
      const attackTarget = state.entities[state.currentAttack.target];
      if (attackTarget) {
        const pz = state.players[attackTarget.current.controller].patrollerIds;
        const pIndex = pz.indexOf(attackTarget.id);
        if (pIndex != -1) {
          if (pz[pIndex - 1] != null) {
            result.push(pz[pIndex - 1]);
          }
          if (pz[pIndex + 1] != null) {
            result.push(pz[pIndex + 1]);
          }
        }
      }
      return result;
  }
}
