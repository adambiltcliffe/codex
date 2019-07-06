import { getAP } from "../util";
import { types } from "../cardinfo";
import log from "../log";
import { killUnits, getCurrentValues } from "../entities";
import { hasKeyword, haste } from "../cardinfo/keywords";
import { patrolSlots } from "../patrolzone";

function isAttackableType(t) {
  return t == types.unit || t == types.building;
}

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
  const attackable = getAttackableEntityIds(state, attackerVals);
  if (!attackable.includes(action.target)) {
    throw new Error(`Target must be one of: ${JSON.stringify(attackable)}`);
  }
  return true;
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
    const canIgnoreSquadLeader = false; // will be more complex eventually
    if (!canIgnoreSquadLeader) {
      return [squadLeaderId];
    }
  }
  // There was no squad leader, so other patrollers are valid targets
  const patrollerIds = player.patrollerIds.filter(id => id !== null);
  if (patrollerIds.length > 0) {
    return patrollerIds;
  }
  // There are no patrollers, so all attackable entities are valid targets
  const allVals = getCurrentValues(state, Object.keys(state.entities));
  return Object.entries(allVals)
    .filter(
      ([ek, ev]) => ev.controller == playerId && isAttackableType(ev.type)
    )
    .map(([ek, ev]) => ek);
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
