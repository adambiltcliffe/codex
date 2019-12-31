import { andJoin, getAP, givePlayerGold } from "./util";
import log from "./log";
import {
  getCurrentValues,
  applyStateBasedEffects,
  createBuildingFixture,
  getAbilityDefinition
} from "./entities";
import { emptyPatrolZone, applyPatrolzoneEffects } from "./patrolzone";
import fixtures, { fixtureNames } from "./fixtures";

import forEach from "lodash/forEach";
import upperFirst from "lodash/upperFirst";
import { drawCards, doDrawPhase } from "./draw";
import { createTrigger } from "./triggers";

export const phases = {
  tech: "P_TECH",
  ready: "P_READY",
  upkeep: "P_UPKEEP",
  main: "P_MAIN",
  draw: "P_DRAW"
};

export function advanceTurn(state) {
  const oldAP = getAP(state);
  oldAP.mustTech = oldAP.workers < 10;
  state.turn++;
  state.activePlayerIndex += 1;
  state.activePlayerIndex %= state.playerList.length;
  // have to do this because of "X during your turn" effects
  applyStateBasedEffects(state);
  enterTechPhase(state);
}

export function advancePhase(state) {
  if (state.phase == phases.tech) {
    enterReadyPhase(state);
  } else if (state.phase == phases.ready) {
    enterUpkeepPhase(state);
  } else if (state.phase == phases.upkeep) {
    enterMainPhase(state);
  } else if (state.phase == phases.main) {
    enterDrawPhase(state);
  } else if (state.phase == phases.draw) {
    doEndOfTurnEffects(state);
    advanceTurn(state);
  }
}

export function enterTechPhase(state) {
  state.madeWorkerThisTurn = false;
  state.constructing = [];
  state.phase = phases.tech;
  if (state.turn < state.playerList.length) {
    // it's a player's first turn so they cannot tech
    return;
  }
  createTrigger(state, {
    path: "triggerInfo.tech",
    triggerSilently: true
  });
}

export function enterReadyPhase(state) {
  state.phase = phases.ready;
  const ap = getAP(state);
  ap.patrollerIds = emptyPatrolZone;
  // this covers "X while patrolling" effects
  applyStateBasedEffects(state);
  applyPatrolzoneEffects(state);
  const readied = [];
  forEach(state.entities, u => {
    u.thisTurn = {};
    if (u.current.controller == ap.id && !u.ready) {
      readied.push(u.current.name);
      u.ready = true;
    }
  });
  if (readied.length > 0) {
    log.add(state, log.fmt`${ap} readies ${andJoin(readied)}.`);
  }
}

export function enterUpkeepPhase(state) {
  state.phase = phases.upkeep;
  const ap = getAP(state);
  const workerGold = givePlayerGold(state, ap.id, ap.workers);
  log.add(state, log.fmt`${ap} gains ${workerGold} gold from workers.`);
  if (ap.current.fixtures[fixtureNames.surplus]) {
    drawCards(state, ap.id, 1, " from surplus");
  }
  forEach(state.entities, u => {
    if (u.current.controller == ap.id) {
      forEach(u.current.abilities, (a, index) => {
        const ad = getAbilityDefinition(a);
        if (ad.triggerOnUpkeep) {
          createTrigger(state, {
            path: a.path,
            sourceId: u.id
          });
        }
      });
    }
  });
}

export function enterMainPhase(state) {
  state.phase = phases.main;
}

export function enterDrawPhase(state) {
  state.phase = phases.draw;
  doDrawPhase(state);
  forEach(state.entities, e => {
    forEach(e.current.abilities, a => {
      const ad = getAbilityDefinition(a);
      if (
        ad.triggerAtEndOfTurn &&
        (!ad.shouldTrigger || ad.shouldTrigger({ state, source: e }))
      ) {
        createTrigger(state, {
          path: a.path,
          sourceId: e.id
        });
      }
    });
  });
}

export function doEndOfTurnEffects(state) {
  const ap = getAP(state);
  state.constructing.forEach(f => {
    createBuildingFixture(state, ap.id, f);
    log.add(state, `${upperFirst(fixtures[f].name)} finishes construction.`);
  });
  forEach(ap.heroCooldowns, (cd, hero) => {
    ap.heroCooldowns[hero] = cd == 0 ? 0 : cd - 1;
  });
}
