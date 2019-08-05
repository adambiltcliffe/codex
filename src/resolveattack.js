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
      if (!hasKeyword(attackerValues, readiness)) {
        attacker.ready = false;
      }
      attacker.thisTurn.attacks = 1 + (attacker.thisTurn.attacks || 0);
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
