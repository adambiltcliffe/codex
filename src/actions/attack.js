import { andJoin, getAP } from "../util";
import { types } from "../cardinfo";
import log from "../log";
import { updateCurrentValues, getAbilityDefinition } from "../entities";
import {
  hasKeyword,
  flying,
  haste,
  antiAir,
  invisible,
  readiness,
  stealth,
  unstoppable
} from "../cardinfo/abilities/keywords";
import { patrolSlots } from "../patrolzone";
import { fixtureNames } from "../fixtures";

import invert from "lodash/invert";
import { createTrigger } from "../triggers";

function isAttackableType(t) {
  return t == types.unit || t == types.hero || t == types.building;
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
  if (attacker.current.controller != ap.id) {
    throw new Error("You don't control the attacker.");
  }
  if (
    attacker.current.type != types.unit &&
    attacker.current.type != types.hero
  ) {
    throw new Error("Only units and heroes can attack.");
  }
  if (
    attacker.controlledSince == state.turn &&
    !hasKeyword(attacker.current, haste)
  ) {
    throw new Error("Attacker has arrival fatigue.");
  }
  if (!attacker.ready) {
    throw new Error("Attacker is exhausted.");
  }
  if (
    hasKeyword(attacker.current, readiness) &&
    attacker.thisTurn.attacks > 0
  ) {
    throw new Error(
      "Attacker has readiness but has already attacked this turn."
    );
  }
  const attackable = getAttackableEntityIds(state, attacker);
  if (!attackable.includes(action.target)) {
    throw new Error(
      `Not a legal target, legal target IDs are: ${andJoin(attackable)}`
    );
  }
  return true;
}

function canAttack(attacker, target, patrolSlot) {
  if (hasKeyword(target.current, invisible) && patrolSlot == null) {
    return false;
  }
  return (
    hasKeyword(attacker.current, flying) ||
    hasKeyword(attacker.current, antiAir) ||
    !hasKeyword(target.current, flying)
  );
}

function canIgnorePatroller(state, attacker, patroller, patrolSlot) {
  // If this is called in the middle of an attack, we're choosing an overpower
  // target, so we can ignore the thing we're actually attacking
  if (state.currentAttack && state.currentAttack.target == patroller.id) {
    return true;
  }
  // Now the normal rules for when you can really ignore a patroller
  if (!canAttack(attacker, patroller, patrolSlot)) {
    return true;
  }
  // Note we don't check stealth/invisible/unstoppable or "unstoppable when
  // attacking X" here (but we do need to check "unstoppable by X")
  if (
    hasKeyword(attacker.current, antiAir) &&
    hasKeyword(patroller.current, flying)
  ) {
    return true;
  }
  if (
    hasKeyword(attacker.current, flying) &&
    !hasKeyword(patroller.current, flying)
  ) {
    return true;
  }
  return false;
}

function hasStealthAbility(attacker) {
  if (
    !hasKeyword(attacker.current, stealth) &&
    !hasKeyword(attacker.current, invisible)
  ) {
    return false;
  }
  return !attacker.thisTurn.detected;
}

export function hasUsableStealthAbility(state, attacker, defendingPlayerId) {
  if (!hasStealthAbility(attacker)) {
    return false;
  }
  const tower =
    state.entities[
      state.players[defendingPlayerId].current.fixtures[fixtureNames.tower]
    ];
  return !tower || tower.thisTurn.usedDetector;
}

export function detectAttackerWithTower(state, attacker, defendingPlayerId) {
  if (!hasStealthAbility(attacker)) {
    return;
  }
  const tower =
    state.entities[
      state.players[defendingPlayerId].current.fixtures[fixtureNames.tower]
    ];
  if (!tower || tower.thisTurn.usedDetector) {
    return;
  }
  tower.thisTurn.usedDetector = true;
  attacker.thisTurn.detected = true;
  log.add(
    state,
    `${attacker.current.name} is detected by ${tower.current.name}.`
  );
}

export function getAttackableEntityIds(state, attacker) {
  if (attacker.current == undefined) {
    console.log(new Error().stack);
  }
  let result = [];
  state.playerList.forEach(playerId => {
    if (playerId != attacker.current.controller) {
      result = result.concat(
        getAttackableEntityIdsControlledBy(state, attacker, playerId)
      );
    }
  });
  return result;
}

export function getAttackableEntityIdsControlledBy(state, attacker, playerId) {
  if (
    hasUsableStealthAbility(state, attacker, playerId) ||
    hasKeyword(attacker.current, unstoppable)
  ) {
    return getFullAttackableEntitiesControlledBy(state, attacker, playerId).map(
      e => e.id
    );
  }
  const player = state.players[playerId];
  const squadLeaderId = player.patrollerIds[patrolSlots.squadLeader];
  if (squadLeaderId != null) {
    const canIgnoreSquadLeader = canIgnorePatroller(
      state,
      attacker,
      state.entities[squadLeaderId],
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
  const attackablePatrollerIds = patrollerIds.filter(id =>
    canAttack(attacker, state.entities[id], slots[id])
  );
  const blockingPatrollerIds = patrollerIds.filter(
    id => !canIgnorePatroller(state, attacker, state.entities[id], slots[id])
  );
  if (blockingPatrollerIds.length > 0) {
    return attackablePatrollerIds;
  }
  // There are no patrollers, so all attackable entities are valid targets
  return getFullAttackableEntitiesControlledBy(state, attacker, playerId).map(
    e => e.id
  );
}

function getFullAttackableEntitiesControlledBy(state, attacker, playerId) {
  return Object.values(state.entities).filter(
    e =>
      e.current.controller == playerId &&
      isAttackableType(e.current.type) &&
      canAttack(attacker, e, null)
  );
}

export function doAttackAction(state, action) {
  const defendingPlayer = state.entities[action.target].current.controller;
  state.currentAttack = {
    ...action,
    begun: false,
    defendingPlayer
  };
  // have to do this here because of "X while attacking" effects
  updateCurrentValues(state);
  const u = state.entities[action.attacker];
  u.current.abilities.forEach((a, index) => {
    const ad = getAbilityDefinition(a);
    if (ad.triggerOnAttack) {
      createTrigger(state, {
        path: a.path,
        sourceId: u.id
      });
    }
  });
  log.add(
    state,
    log.fmt`${getAP(state)} declares an attack with ${u.current.name}.`
  );
  detectAttackerWithTower(state, u, defendingPlayer);
}
