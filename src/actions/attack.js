import { getAP } from "../util";
import { types } from "../cardinfo";
import log from "../log";
import { killUnits, getCurrentValues } from "../entities";
import { hasKeyword, flying, haste, antiAir } from "../cardinfo/keywords";
import { patrolSlots } from "../patrolzone";
import { andJoin } from "../util";

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
  if (attackerVals.type != types.unit) {
    throw new Error("Only units can attack.");
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
  const attackable = getAttackableEntityIds(state, attackerVals);
  if (!attackable.includes(action.target)) {
    throw new Error(
      `Not a legal target, legal target IDs are: ${andJoin(attackable)}`
    );
  }
  return true;
}

function canAttack(attackerVals, targetVals) {
  return (
    hasKeyword(attackerVals, flying) ||
    hasKeyword(attackerVals, antiAir) ||
    !hasKeyword(targetVals, flying)
  );
}

function canIgnorePatroller(attackerVals, patrollerVals) {
  if (!canAttack(attackerVals, patrollerVals)) {
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
      getCurrentValues(state, squadLeaderId)
    );
    if (!canIgnoreSquadLeader) {
      return [squadLeaderId];
    }
  }
  // There was no squad leader, so other patrollers are valid targets
  // Squad leader will still be included if it was present but ignorable
  const patrollerIds = player.patrollerIds.filter(id => id !== null);
  const patrollerVals = getCurrentValues(state, patrollerIds);
  const attackablePatrollerIds = patrollerIds.filter(id =>
    canAttack(attackerVals, patrollerVals[id])
  );
  const blockingPatrollerIds = patrollerIds.filter(
    id => !canIgnorePatroller(attackerVals, patrollerVals[id])
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
        canAttack(attackerVals, ev)
    )
    .map(([ek, _ev]) => ek);
}

function getFlownOverVals(state, playerId, targetId) {
  const patrollerIds = state.players[playerId].patrollerIds;
  if (targetId == patrollerIds[patrolSlots.squadLeader]) {
    // Attacking squad leader, don't need to fly over anything
    return [];
  }
  if (patrollerIds.includes(targetId)) {
    // Attacking a patroller, only squad leader flown over
    return [patrollerIds[patrolSlots.squadLeader]]
      .filter(id => id != null)
      .map(id => getCurrentValues(state, id))
      .filter(v => hasKeyword(v, antiAir));
  }
  // Otherwise we are potentially flying over all patrollers
  const vals = getCurrentValues(state, patrollerIds);
  return patrollerIds
    .filter(id => id != null)
    .map(id => vals[id])
    .filter(v => hasKeyword(v, antiAir));
}

export function doAttackAction(state, action) {
  const attacker = state.entities[action.attacker];
  const target = state.entities[action.target];
  const values = getCurrentValues(state, [attacker.id, target.id]);
  const attackerValues = values[attacker.id];
  const targetValues = values[target.id];
  const flownOverVals = hasKeyword(attackerValues, flying)
    ? getFlownOverVals(state, targetValues.controller, target.id)
    : [];
  const flownOverText =
    flownOverVals.length == 0
      ? ""
      : `, flying over ${andJoin(flownOverVals.map(v => v.name))}`;
  log.add(
    state,
    log.fmt`${getAP(state)} attacks ${targetValues.name} with ${
      attackerValues.name
    }${flownOverText}.`
  );
  attacker.ready = false;
  const attackerReceivesDamage =
    !hasKeyword(attackerValues, flying) ||
    hasKeyword(targetValues, flying) ||
    hasKeyword(targetValues, antiAir);
  if (attackerReceivesDamage) {
    attacker.damage += targetValues.attack;
  }
  flownOverVals.forEach(v => {
    attacker.damage += v.attack;
  });
  target.damage += attackerValues.attack;
  killUnits(state);
}
