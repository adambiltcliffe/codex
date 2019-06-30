import { getAP } from "../util";
import { types } from "../cardinfo";
import log from "../log";
import { killUnits, getCurrentValues } from "../entities";
import { hasKeyword, haste } from "../cardinfo/keywords";
import { patrolSlots } from "../patrolzone";

export function checkAttackAction(state, action) {
  const ap = getAP(state);
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
  const target = state.entities[action.target];
  if (typeof target != "object") {
    throw new Error("Invalid target ID.");
  }
  const targetVals = getCurrentValues(state, target.id);
  if (targetVals.controller == ap.id) {
    throw new Error("Can't attack your own unit.");
  }
  // Now check all of the patrol zone rules are satisfied
  const squadLeaderId = state.patrollerIds[patrolSlots.squadLeader];
  if (squadLeaderId != null) {
    if (target.id == squadLeaderId) {
      return true; // this is fine until the squad leader can have flying
    }
    const canIgnoreSquadLeader = false; // will be more complex eventually
    if (!canIgnoreSquadLeader) {
      throw new Error("You must attack the Squad Leader first.");
    }
  }
  const patrollerIds = state.patrollerIds.filter(id => id !== null);
  if (patrollerIds.length > 0) {
    if (patrollerIds.includes(target.id)) {
      return true;
    }
    // do some more canIgnorePatrollers logic here eventually
    throw new Error("You must attack a patroller.");
  }
  return true;
}

export function doAttackAction(state, action) {
  const attacker = state.entities[action.attacker];
  const target = state.entities[action.target];
  const values = getCurrentValues(state, [attacker.id, target.id]);
  const attackerValues = values[attacker.id];
  const targetValues = values[target.id];
  log.add(
    state,
    log.fmt`${getAP(state)} attacks ${targetValues.name} with ${
      attackerValues.name
    }.`
  );
  attacker.ready = false;
  attacker.damage += targetValues.attack;
  target.damage += attackerValues.attack;
  killUnits(state);
}
