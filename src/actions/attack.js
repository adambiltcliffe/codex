import { getAP } from "../util";
import { types } from "../cardinfo";
import log from "../log";
import { getCurrentValues, updateCurrentValues } from "../entities";
import {
  hasKeyword,
  flying,
  haste,
  antiAir,
  invisible,
  readiness
} from "../cardinfo/abilities/keywords";
import { patrolSlots } from "../patrolzone";
import { andJoin } from "../util";
import invert from "lodash/invert";

function isAttackableType(t) {
  return t == types.unit || t == types.building;
}

export function checkAttackAction(state, action) {
  const ap = getAP(state);
  if (typeof action.attacker != "string") {
    throw new Error("Attacker ID must be a string");
  }
  const attacker = state.entities[action.attacker];
  if (typeof attacker != "object") {
    throw new Error("Invalid attacker ID.");
  }
  const attackerVals = getCurrentValues(state, attacker.id);
  if (attackerVals.controller != ap.id) {
    throw new Error("You don't control the attacker.");
  }
  if (attackerVals.type != types.unit && attackerVals.type != types.hero) {
    throw new Error("Only units and heroes can attack.");
  }
  if (
    attacker.controlledSince == state.turn &&
    !hasKeyword(attackerVals, haste)
  ) {
    throw new Error("Attacker has arrival fatigue.");
  }
  if (!attacker.ready) {
    throw new Error("Attacker is exhausted.");
  }
  if (hasKeyword(attackerVals, readiness) && attacker.thisTurn.attacks > 0) {
    throw new Error(
      "Attacker has readiness but has already attacked this turn."
    );
  }
  const attackable = getAttackableEntityIds(state, attackerVals);
  if (!attackable.includes(action.target)) {
    throw new Error(
      `Not a legal target, legal target IDs are: ${andJoin(attackable)}`
    );
  }
  return true;
}

function canAttack(attackerVals, targetVals, patrolSlot) {
  if (hasKeyword(targetVals, invisible) && patrolSlot == null) {
    return false;
  }
  return (
    hasKeyword(attackerVals, flying) ||
    hasKeyword(attackerVals, antiAir) ||
    !hasKeyword(targetVals, flying)
  );
}

function canIgnorePatroller(attackerVals, patrollerVals, patrolSlot) {
  if (!canAttack(attackerVals, patrollerVals, patrolSlot)) {
    return true;
  }
  if (hasKeyword(attackerVals, invisible)) {
    return true;
  }
  if (hasKeyword(attackerVals, antiAir) && hasKeyword(patrollerVals, flying)) {
    return true;
  }
  return hasKeyword(attackerVals, flying) && !hasKeyword(patrollerVals, flying);
}

export function getAttackableEntityIds(state, attackerVals) {
  let result = [];
  state.playerList.forEach(playerId => {
    if (playerId != attackerVals.controller) {
      result = result.concat(
        getAttackableEntityIdsControlledBy(state, attackerVals, playerId)
      );
    }
  });
  return result;
}

export function getAttackableEntityIdsControlledBy(
  state,
  attackerVals,
  playerId
) {
  const player = state.players[playerId];
  const squadLeaderId = player.patrollerIds[patrolSlots.squadLeader];
  if (squadLeaderId != null) {
    const canIgnoreSquadLeader = canIgnorePatroller(
      attackerVals,
      getCurrentValues(state, squadLeaderId),
      patrolSlots.squadLeader
    );
    if (!canIgnoreSquadLeader) {
      return [squadLeaderId];
    }
  }
  // There was no squad leader, so other patrollers are valid targets
  // Squad leader will still be included if it was present but ignorable
  const slots = invert(player.patrollerIds);
  const patrollerIds = player.patrollerIds.filter(id => id !== null);
  const patrollerVals = getCurrentValues(state, patrollerIds);
  const attackablePatrollerIds = patrollerIds.filter(id =>
    canAttack(attackerVals, patrollerVals[id], slots[id])
  );
  const blockingPatrollerIds = patrollerIds.filter(
    id => !canIgnorePatroller(attackerVals, patrollerVals[id], slots[id])
  );
  if (blockingPatrollerIds.length > 0) {
    return attackablePatrollerIds;
  }
  // There are no patrollers, so all attackable entities are valid targets
  const allVals = getCurrentValues(state, Object.keys(state.entities));
  return Object.entries(allVals)
    .filter(
      ([_ek, ev]) =>
        ev.controller == playerId &&
        isAttackableType(ev.type) &&
        canAttack(attackerVals, ev, null)
    )
    .map(([ek, _ev]) => ek);
}

export function doAttackAction(state, action) {
  state.currentAttack = { ...action, begun: false };
  // have to do this here because of "X while attacking" effects
  updateCurrentValues(state);
  const u = state.entities[action.attacker];
  const attackerVals = getCurrentValues(state, u.id);
  let triggered = false;
  attackerVals.abilities.forEach((a, index) => {
    if (a.triggerOnAttack) {
      state.newTriggers.push({
        path: a.path,
        sourceId: u.id
      });
      triggered = true;
    }
  });
  if (triggered) {
    // If nothing triggered, this message is redundant as the next one will
    // describe the attack in detail anyway
    log.add(
      state,
      log.fmt`${getAP(state)} declares an attack with ${attackerVals.name}.`
    );
  }
}
