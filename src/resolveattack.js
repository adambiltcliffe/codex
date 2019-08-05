import { getCurrentValues, applyStateBasedEffects } from "./entities";
import {
  hasKeyword,
  antiAir,
  flying,
  readiness
} from "./cardinfo/abilities/keywords";
import { andJoin, getAP } from "./util";
import log from "./log";
import { patrolSlots } from "./patrolzone";

function getFlownOver(state, target) {
  const playerId = target.current.controller;
  const patrollerIds = state.players[playerId].patrollerIds;
  if (target.id == patrollerIds[patrolSlots.squadLeader]) {
    // Attacking squad leader, don't need to fly over anything
    return [];
  }
  if (patrollerIds.includes(target.id)) {
    // Attacking a patroller, only squad leader flown over
    return [patrollerIds[patrolSlots.squadLeader]]
      .filter(id => id != null)
      .map(id => state.entities[id])
      .filter(e => hasKeyword(e.current, antiAir));
  }
  // Otherwise we are potentially flying over all patrollers
  return patrollerIds
    .filter(id => id != null)
    .map(id => state.entities[id])
    .filter(e => hasKeyword(e.current, antiAir));
}

export function enqueueResolveAttack(state) {
  if (!state.currentAttack.begun) {
    state.queue.push({ path: "triggerInfo.beginResolveAttack" });
  } else {
    state.queue.push({ path: "triggerInfo.finishResolveAttack" });
  }
}

const resolveAttackTriggers = {
  beginResolveAttack: {
    action: ({ state }) => {
      const attacker = state.entities[state.currentAttack.attacker];
      const target = state.entities[state.currentAttack.target];
      const flownOver = hasKeyword(attacker.current, flying)
        ? getFlownOver(state, target)
        : [];
      const flownOverText =
        flownOver.length == 0
          ? ""
          : `, flying over ${andJoin(flownOver.map(e => e.current.name))}`;
      log.add(
        state,
        log.fmt`${getAP(state)} attacks ${target.current.name} with ${
          attacker.current.name
        }${flownOverText}.`
      );
      if (!hasKeyword(attacker.current, readiness)) {
        attacker.ready = false;
      }
      attacker.thisTurn.attacks = 1 + (attacker.thisTurn.attacks || 0);
      const attackerReceivesDamage =
        !hasKeyword(attacker.current, flying) ||
        hasKeyword(target.current, flying) ||
        hasKeyword(target.current, antiAir);
      if (attackerReceivesDamage) {
        attacker.damage += target.current.attack;
      }
      flownOver.forEach(e => {
        attacker.damage += e.current.attack;
      });
      target.damage += attacker.current.attack;
      state.currentAttack.begun = true;
      applyStateBasedEffects(state);
    }
  },
  finishResolveAttack: {
    action: ({ state }) => {
      state.currentAttack = null;
      log.add(state, "Attack complete.");
    }
  }
};

export default resolveAttackTriggers;
