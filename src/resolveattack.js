import { targetMode } from "./cardinfo/constants";
import { applyStateBasedEffects } from "./entities";
import {
  hasKeyword,
  antiAir,
  flying,
  readiness,
  swiftStrike,
  overpower,
  sparkshot
} from "./cardinfo/abilities/keywords";
import { andJoin } from "./util";
import log from "./log";
import { patrolSlots } from "./patrolzone";

import partition from "lodash/partition";

const overpowerStep = 0;
const sparkshotStep = 1;

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

function attackerAboutToDealDamage(state) {
  const a = state.currentAttack;
  const attacker = state.entities[a.attacker];
  if (a == undefined) {
    // the attacker died somehow
    return false;
  }
  if (!a.begun) {
    //about to do swift strike damage
    return hasKeyword(attacker.current, swiftStrike);
  } else {
    // about to do regular damage
    return !a.attackerDealtDamage;
  }
}

export function needsOverpowerTarget(state) {
  const attacker = state.entities[state.currentAttack.attacker];
  return (
    hasKeyword(attacker.current, overpower) && attackerAboutToDealDamage(state)
  );
}

export function needsSparkshotTarget(state) {
  const attacker = state.entities[state.currentAttack.attacker];
  return (
    hasKeyword(attacker.current, sparkshot) && attackerAboutToDealDamage(state)
  );
}

const chooseOverpowerTarget = {
  prompt: "Choose where to deal excess damage with overpower",
  targetMode: targetMode.overpower,
  action: () => {}
};

const chooseSparkshotTarget = {
  prompt: "Choose a patroller to receive sparkshot damage",
  targetMode: targetMode.sparkshot,
  action: () => {}
};

const resolveAttackTriggers = {
  beginResolveAttack: {
    steps: [
      chooseOverpowerTarget,
      chooseSparkshotTarget,
      {
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
            `${attacker.current.name} attacks ${
              target.current.name
            }${flownOverText}.`
          );
          if (!hasKeyword(attacker.current, readiness)) {
            attacker.ready = false;
          }
          attacker.thisTurn.attacks = 1 + (attacker.thisTurn.attacks || 0);
          const defenders = flownOver;
          const attackerReceivesDamage =
            !hasKeyword(attacker.current, flying) ||
            hasKeyword(target.current, flying) ||
            hasKeyword(target.current, antiAir);
          if (attackerReceivesDamage) {
            defenders.push(target);
          }
          if (hasKeyword(attacker.current, swiftStrike)) {
            dealAttackerDamage(state, attacker, target);
            state.currentAttack.attackerDealtDamage = true;
          } else {
            state.currentAttack.attackerDealtDamage = false;
          }
          const [swiftDefenders, slowDefenders] = partition(defenders, e =>
            hasKeyword(e.current, swiftStrike)
          );
          swiftDefenders.forEach(e => {
            attacker.damage += e.current.attack;
          });
          state.currentAttack.begun = true;
          state.currentAttack.slowDefenderIds = slowDefenders.map(e => e.id);
          applyStateBasedEffects(state);
        }
      }
    ]
  },
  finishResolveAttack: {
    steps: [
      chooseOverpowerTarget,
      chooseSparkshotTarget,
      {
        action: ({ state }) => {
          const attacker = state.entities[state.currentAttack.attacker];
          // It's possible the attacker died during swift strike damage
          if (attacker != undefined) {
            const target = state.entities[state.currentAttack.target];
            if (!state.currentAttack.attackerDealtDamage) {
              dealAttackerDamage(state, attacker, target);
            }
            state.currentAttack.slowDefenderIds.forEach(id => {
              if (state.entities[id] != undefined) {
                attacker.damage += state.entities[id].current.attack;
              }
            });
            state.currentAttack = null;
            // Do this after setting currentAttack to null to remove
            // "X when attacking" type buffs
            applyStateBasedEffects(state);
          }
        }
      }
    ]
  }
};

function dealAttackerDamage(state, attacker, target) {
  const lethal = target.current.hp - target.damage;
  if (
    hasKeyword(attacker.current, overpower) &&
    attacker.current.attack > lethal
  ) {
    target.damage += lethal;
    state.entities[
      state.currentTrigger.choices[overpowerStep].targetId
    ].damage += attacker.current.attack - lethal;
  } else {
    target.damage += attacker.current.attack;
  }
  if (hasKeyword(attacker.current, sparkshot)) {
    state.entities[
      state.currentTrigger.choices[sparkshotStep].targetId
    ].damage += 1;
  }
}

export default resolveAttackTriggers;
