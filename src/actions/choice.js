import { currentTriggerDefinition } from "../triggers";
import { getAP, andJoin } from "../util";
import {
  getResistCost,
  getLegalChoicesForStep,
  unwrapSecrets
} from "../targets";
import log from "../log";
import { targetMode } from "../cardinfo";
import { getObliterateTargets } from "../cardinfo/abilities/obliterate";
import { hasKeyword, invisible } from "../cardinfo/abilities/keywords";

import countBy from "lodash/countBy";
import forEach from "lodash/forEach";
import some from "lodash/some";
import sumBy from "lodash/sumBy";
import { fixtureNames } from "../fixtures";

export function checkChoiceAction(state, action) {
  if (state.currentTrigger === null) {
    throw new Error("Can't make choices when a trigger isn't resolving");
  }
  let stepDef = currentTriggerDefinition(state);
  if (stepDef.steps) {
    stepDef = stepDef.steps[state.currentTrigger.stepIndex];
  }
  switch (stepDef.targetMode) {
    case targetMode.single:
      const legalChoices = getLegalChoicesForStep(state, stepDef);
      if (!legalChoices.includes(action.target)) {
        throw new Error(
          `Not a legal choice, legal choices are ${andJoin(legalChoices)}`
        );
      }
      return true;
    case targetMode.obliterate:
      const dpId = state.currentAttack.defendingPlayer;
      const [definitely, maybe] = getObliterateTargets(
        state,
        dpId,
        stepDef.targetCount
      );
      const choicesNeeded = stepDef.targetCount - definitely.length;
      if (action.targets.length != choicesNeeded) {
        throw new Error("Wrong number of units to obliterate");
      }
      action.targets.forEach(id => {
        if (!some(maybe, e => e.id == id)) {
          throw new Error(
            `${id} is not among valid choices: ${andJoin(maybe.map(e => e.id))}`
          );
        }
      });
      return true;
    case targetMode.modal:
      if (!Number.isInteger(action.index)) {
        throw new Error("action.index must be a number");
      }
      if (action.index < 0 || action.index >= stepDef.options.length) {
        throw new Error("Index is out of range");
      }
      return true;
    case targetMode.codex:
      if (!Array.isArray(action.indices)) {
        throw new Error("action.indices must be an array");
      }
      const ap = getAP(state);
      const realIndices = unwrapSecrets(
        state,
        ap.id,
        action.indices,
        ap.codex.length
      );
      const counts = countBy(realIndices);
      const cardsInCodex = sumBy(ap.codex, "n");
      let total = 0;
      forEach(counts, (count, index) => {
        total += count;
        if (ap.codex[index] === undefined) {
          throw new Error("Illegal index");
        }
        if (ap.codex[index].n < count) {
          throw new Error("Not enough cards in codex");
        }
      });
      if (total > stepDef.cardCount) {
        throw new Error("Too many cards");
      }
      if (
        stepDef.mustFindFullAmount &&
        stepDef.mustFindFullAmount(state) &&
        total < stepDef.cardCount &&
        total < cardsInCodex
      ) {
        throw new Error("Not enough cards");
      }
      return true;
  }
}

export function doChoiceAction(state, action) {
  const ap = getAP(state);
  const def = currentTriggerDefinition(state);
  let choices = state.currentTrigger.choices;
  let stepDef = def;
  if (def.steps) {
    choices = choices[state.currentTrigger.stepIndex];
    stepDef = def.steps[state.currentTrigger.stepIndex];
  }
  switch (stepDef.targetMode) {
    case targetMode.single:
      choices.targetId = action.target;
      const target = state.entities[action.target];
      if (
        stepDef.hasTargetSymbol &&
        target.current.controller != getAP(state).id
      ) {
        doTargetSymbolEffects(state, target);
      }
      log.add(state, log.fmt`${getAP(state)} chooses ${target.current.name}.`);
      break;
    case targetMode.obliterate:
      choices.targetIds = action.targets;
      break;
    case targetMode.modal:
      choices.index = action.index;
      break;
    case targetMode.codex:
      choices.indices = action.indices;
      break;
  }
}

export function doTargetSymbolEffects(state, target) {
  const ap = getAP(state);
  const resistCost = getResistCost(state, target);
  ap.gold -= resistCost;
  if (hasKeyword(target.current, invisible) && !target.thisTurn.detected) {
    const tower =
      state.entities[state.players[ap.id].current.fixtures[fixtureNames.tower]];
    tower.thisTurn.usedDetector = true;
    target.thisTurn.detected = true;
    log.add(
      state,
      `${target.current.name} is detected by ${tower.current.name}.`
    );
  }
}
