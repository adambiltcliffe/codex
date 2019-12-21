import { targetMode, types } from "./cardinfo/constants";
import { patrolSlots } from "./patrolzone";
import { applyStateBasedEffects, exhaustEntity, queueDamage } from "./entities";
import {
  hasKeyword,
  antiAir,
  flying,
  readiness,
  swiftStrike,
  overpower,
  sparkshot,
  stealth,
  invisible
} from "./cardinfo/abilities/keywords";
import { andJoin } from "./util";
import log from "./log";
import {
  getAttackableEntityIds,
  detectAttackerWithTower,
  hasUsableStealthAbility
} from "./actions/attack";
import { fixtureNames } from "./fixtures";

import partition from "lodash/partition";

const findDefendersStep = 0;
const retargetAttackStep = 1;
const overpowerStep = 2;
const sparkshotStep = 3;

function canEvadeTower(attacker) {
  return (
    hasKeyword(attacker.current, stealth) ||
    hasKeyword(attacker.current, invisible)
  );
}

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
    attacker !== undefined &&
    hasKeyword(attacker.current, overpower) &&
    attackerAboutToDealDamage(state)
  );
}

export function needsSparkshotTarget(state) {
  const attacker = state.entities[state.currentAttack.attacker];
  return (
    attacker !== undefined &&
    hasKeyword(attacker.current, sparkshot) &&
    attackerAboutToDealDamage(state)
  );
}

const doNothing = { action: () => {} };

const retargetAttack = {
  prompt: "Choose a new attack target",
  hasTargetSymbol: false,
  targetTypes: [types.unit, types.hero, types.building],
  targetMode: targetMode.single,
  restrictTargets: state =>
    getAttackableEntityIds(state, state.entities[state.currentAttack.attacker])
      .filter(id => id != state.currentAttack.target)
      .map(id => state.entities[id]),
  shouldSkipChoice: state => {
    const attacker = state.entities[state.currentAttack.attacker];
    const target = state.entities[state.currentAttack.target];
    return attacker === undefined || target !== undefined;
  },
  action: ({ state, choices }) => {
    if (choices.targetId !== undefined) {
      state.currentAttack.target = choices.targetId;
      detectAttackerWithTower(
        state,
        state.entities[state.currentAttack.attacker],
        state.currentAttack.defendingPlayerId
      );
    }
  }
};

const findDefenders = {
  action: ({ state }) => {
    const attacker = state.entities[state.currentAttack.attacker];
    const target = state.entities[state.currentAttack.target];
    if (attacker === undefined || target === undefined) {
      return;
    }
    const flownOver =
      hasKeyword(attacker.current, flying) &&
      !hasUsableStealthAbility(
        state,
        attacker,
        state.currentAttack.defendingPlayerId
      )
        ? getFlownOver(state, target)
        : [];
    const flownOverText =
      flownOver.length == 0
        ? ""
        : `, flying over ${andJoin(flownOver.map(e => e.current.name))}`;
    log.add(
      state,
      `${attacker.current.name} attacks ${target.current.name}${flownOverText}.`
    );
    if (!hasKeyword(attacker.current, readiness)) {
      exhaustEntity(state, attacker.id);
      //attacker.ready = false;
    }
    attacker.thisTurn.attacks = 1 + (attacker.thisTurn.attacks || 0);
    state.currentAttack.flownOverIds = flownOver.map(e => e.id);
  }
};

const chooseOverpowerTarget = {
  prompt: "Choose where to deal excess damage with overpower",
  hasTargetSymbol: false,
  targetTypes: [types.unit, types.hero, types.building],
  targetMode: targetMode.single,
  restrictTargets: state =>
    getAttackableEntityIds(state, state.entities[state.currentAttack.attacker])
      .filter(id => id != state.currentAttack.target)
      .map(id => state.entities[id]),
  shouldSkipChoice: state => !needsOverpowerTarget(state),
  action: () => {}
};

const chooseSparkshotTarget = {
  prompt: "Choose a patroller to receive sparkshot damage",
  hasTargetSymbol: false,
  targetTypes: [types.unit, types.hero],
  targetMode: targetMode.single,
  restrictTargets: state => {
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
    return result.map(id => state.entities[id]);
  },
  shouldSkipChoice: state => !needsSparkshotTarget(state),
  action: () => {}
};

const resolveAttackTriggers = {
  beginResolveAttack: {
    text: "Attack",
    steps: [
      retargetAttack,
      findDefenders,
      chooseOverpowerTarget,
      chooseSparkshotTarget,
      {
        action: ({ state }) => {
          const attacker = state.entities[state.currentAttack.attacker];
          const target = state.entities[state.currentAttack.target];
          if (attacker !== undefined && target !== undefined) {
            const defenders = state.currentAttack.flownOverIds.map(
              id => state.entities[id]
            );
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
              queueDamage(state, {
                amount: e.current.attack,
                sourceId: e.id,
                subjectId: attacker.id,
                isCombatDamage: true
              });
            });
            state.currentAttack.slowDefenderIds = slowDefenders.map(e => e.id);
          }
          state.currentAttack.begun = true;
          applyStateBasedEffects(state);
        }
      }
    ]
  },
  finishResolveAttack: {
    text: "Attack",
    steps: [
      doNothing,
      doNothing,
      chooseOverpowerTarget,
      chooseSparkshotTarget,
      {
        action: ({ state }) => {
          const attacker = state.entities[state.currentAttack.attacker];
          // It's possible the attacker died during swift strike damage
          // If attacker is alive, theoretically target can be dead only if attackerDealtDamage is true
          if (attacker != undefined) {
            const target = state.entities[state.currentAttack.target];
            // ... but check anyway to protect against some really obscure situations
            if (
              !state.currentAttack.attackerDealtDamage &&
              target !== undefined
            ) {
              dealAttackerDamage(state, attacker, target);
            }
            state.currentAttack.slowDefenderIds.forEach(id => {
              if (state.entities[id] != undefined) {
                queueDamage(state, {
                  amount: state.entities[id].current.attack,
                  sourceId: id,
                  subjectId: attacker.id,
                  isCombatDamage: true
                });
              }
            });
          }
          state.currentAttack = null;
          // Do this after setting currentAttack to null to remove
          // "X when attacking" type buffs
          applyStateBasedEffects(state);
        }
      }
    ]
  }
};

function dealAttackerDamage(state, attacker, target) {
  const lethal = target.current.hp - target.damage;
  if (
    hasKeyword(attacker.current, overpower) &&
    attacker.current.attack > lethal &&
    // It's possible no overpower target was chosen because there were no choices
    !state.currentTrigger.choices[overpowerStep].skipped
  ) {
    queueDamage(state, {
      amount: lethal,
      sourceId: attacker.id,
      subjectId: target.id,
      isCombatDamage: true
    });
    const overpowerTarget =
      state.entities[state.currentTrigger.choices[overpowerStep].targetId];
    queueDamage(state, {
      amount: attacker.current.attack - lethal,
      sourceId: attacker.id,
      subjectId: overpowerTarget.id,
      isCombatDamage: true
    });
  } else {
    queueDamage(state, {
      amount: attacker.current.attack,
      sourceId: attacker.id,
      subjectId: target.id,
      isCombatDamage: true
    });
  }
  if (hasKeyword(attacker.current, sparkshot)) {
    const sparkshotTarget =
      state.entities[state.currentTrigger.choices[sparkshotStep].targetId];
    if (sparkshotTarget !== undefined) {
      queueDamage(state, {
        amount: 1,
        subjectId: sparkshotTarget.id,
        sourceId: attacker.id,
        isCombatDamage: true,
        isAbilityDamage: true
      });
    }
  }
  const dpId = target.current.controller;
  const tower =
    state.entities[state.players[dpId].current.fixtures[fixtureNames.tower]];
  if (tower !== undefined && !hasUsableStealthAbility(state, attacker, dpId)) {
    queueDamage(state, {
      amount: 1,
      sourceId: tower.id,
      subjectId: attacker.id,
      isCombatDamage: true
    });
  }
}

export default resolveAttackTriggers;
