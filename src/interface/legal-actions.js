import CodexGame from "../game";
import { getAP } from "../util";

import filter from "lodash/filter";
import fromPairs from "lodash/fromPairs";
import map from "lodash/map";
import partition from "lodash/partition";
import pickBy from "lodash/pickBy";
import range from "lodash/range";
import uniq from "lodash/uniq";

import { getAbilityDefinition } from "../entities";
import { types } from "../cardinfo";
import { fixtureNames } from "../fixtures";

export function requiredActionType(state) {
  if (state.newTriggers && state.newTriggers.length > 0) {
    return "queue";
  }
  if (state.currentTrigger) {
    return "choice";
  }
  return null;
}

export function isLegalAction(state, act) {
  try {
    CodexGame.checkAction(state, act);
    return true;
  } catch (e) {
    return false;
  }
}

// If we can worker, we can do it with any card, so this is just a boolean
export const canTakeWorkerAction = state =>
  isLegalAction(state, { type: "worker", handIndex: 0 });

export const legalAttackActionTree = state => {
  const ap = getAP(state);
  const [apEnts, napEnts] = partition(
    state.entities,
    u => u.current.controller == ap.id
  );
  const attackers = apEnts.filter(
    a => a.current.type == types.unit || a.current.type == types.hero
  );
  return pickBy(
    fromPairs(
      attackers.map(attacker => [
        attacker.id,
        napEnts
          .filter(t =>
            isLegalAction(state, {
              type: "attack",
              attacker: attacker.id,
              target: t.id
            })
          )
          .map(e => e.id)
      ])
    ),
    arr => arr.length > 0
  );
};

export const legalActivateActionTree = state => {
  const ap = getAP(state);
  const apEnts = filter(state.entities, e => e.current.controller == ap.id);
  return pickBy(
    fromPairs(
      apEnts.map(source => [
        source.id,
        source.current.abilities.reduce((acc, a, index) => {
          const ad = getAbilityDefinition(a);
          const legal =
            ad.isActivatedAbility &&
            isLegalAction(state, {
              type: "activate",
              source: source.id,
              index
            });
          return legal ? acc.concat(index) : acc;
        }, [])
      ])
    ),
    arr => arr.length > 0
  );
};

export const legalPlayActions = state => {
  const ap = getAP(state);
  return uniq(ap.hand)
    .map(c => ({ type: "play", card: c }))
    .filter(a => isLegalAction(state, a));
};

export const legalSummonActions = state => {
  const ap = getAP(state);
  return uniq(ap.commandZone)
    .map(h => ({
      type: "summon",
      hero: h
    }))
    .filter(a => isLegalAction(state, a));
};

export const legalLevelActionTree = state => {
  const ap = getAP(state);
  const heroes = filter(
    state.entities,
    e => e.current.type == types.hero && e.current.controller == ap.id
  );
  return fromPairs(
    heroes
      .map(h => [
        h.id,
        range(1, 1 + h.current.maxbandLevel - h.level).filter(n =>
          isLegalAction(state, { type: "level", hero: h.id, amount: n })
        )
      ])
      .filter(([id, acts]) => acts.length > 0)
  );
};

export const legalBuildActions = state =>
  map(fixtureNames, n => ({ type: "build", fixture: n })).filter(a =>
    isLegalAction(state, a)
  );

export const legalPatrollers = state =>
  Object.values(state.entities)
    .filter(
      e =>
        e.current.controller == getAP(state).id &&
        (e.current.type == types.unit || e.current.type == types.hero) &&
        e.ready
    )
    .map(e => e.id);
