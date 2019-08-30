import { getAP } from "../util";
import cardInfo from "../cardinfo";
import log from "../log";
import { getCurrentValues, createUnit, createOngoingSpell } from "../entities";
import { types, colors } from "../cardinfo/constants";
import { addSpellToQueue } from "../triggers";

import findIndex from "lodash/findIndex";
import forEach from "lodash/forEach";
import { techBuildingFixtures } from "../fixtures";

function getPlayCost(state, cardInfo) {
  let currentCost = cardInfo.cost;
  const vals = getCurrentValues(state, Object.keys(state.entities));
  Object.entries(vals).forEach(([id, e]) => {
    e.abilities.forEach(a => {
      if (a.modifyPlayCost) {
        currentCost = a.modifyPlayCost({
          state,
          sourceId: id,
          sourceVals: e,
          cardInfo,
          currentCost
        });
      }
    });
  });
  // Off-color penalty for non-neutral minor spells
  if (
    cardInfo.type == types.spell &&
    cardInfo.minor &&
    cardInfo.color != colors.neutral
  ) {
    if (!getAP(state).current.heroColors.includes(cardInfo.color)) {
      currentCost += 1;
    }
  }
  return currentCost;
}

export function checkPlayAction(state, action) {
  const ap = getAP(state);
  if (ap.hand.indexOf(action.card) == -1) {
    throw new Error("Card not in hand");
  }
  const playCost = getPlayCost(state, cardInfo[action.card]);
  if (ap.gold < playCost) {
    throw new Error(`Not enough gold, cost is ${playCost}`);
  }
  const ci = cardInfo[action.card];
  if (ci.type == types.spell) {
    const heroSpecs = ap.current.heroSpecs;
    if ((!ci.minor && !heroSpecs.includes(ci.spec)) || heroSpecs.length == 0) {
      throw new Error("Don't have the right hero to cast that spell");
    }
    if (ci.ultimate && !ap.current.ultimateSpecs.includes(ci.spec)) {
      throw new Error("Your hero was not max level at the start of the turn");
    }
  } else {
    if (ci.tech > 0) {
      if (ap.current.fixtures[techBuildingFixtures[ci.tech]] === undefined) {
        throw new Error(
          "You don't have the correct tech building to play that"
        );
      }
    }
  }
}

export function doPlayAction(state, action) {
  state.updateHidden(fs => {
    const ap = getAP(fs);
    const handIndex = ap.hand.indexOf(action.card);
    fs.playedCard = ap.hand.splice(handIndex, 1)[0];
  });
  const ap = getAP(state);
  const ci = cardInfo[action.card];
  ap.gold -= getPlayCost(state, ci);
  forEach(state.entities, e => {
    forEach(e.current.abilities, a => {
      if (
        a.triggerOnPlayOtherCard &&
        (!a.shouldTrigger || a.shouldTrigger({ state, cardInfo: ci }))
      ) {
        state.newTriggers.push({
          path: a.path,
          sourceId: e.id
        });
      }
    });
  });
  if (ci.type == types.spell) {
    playSpell(state);
  } else {
    const ap = getAP(state);
    const card = state.playedCard;
    delete state.playedCard;
    const newUnit = putUnitIntoPlay(state, ap.id, card);
    log.add(state, log.fmt`${ap} plays ${newUnit.current.name}.`);
  }
}

function playSpell(state) {
  const ap = getAP(state);
  const ci = cardInfo[state.playedCard];
  log.add(state, log.fmt`${ap} plays ${ci.name}.`);
  const spellEffectIndex = findIndex(ci.abilities, a => a.isSpellEffect);
  if (spellEffectIndex != -1) {
    // if an ongoing spell has a spell effect, the effect has to put it into play itself
    addSpellToQueue(state, {
      path: `cardInfo.${state.playedCard}.abilities[${spellEffectIndex}]`,
      isSpell: true
    });
  } else {
    if (ci.ongoing) {
      createOngoingSpell(state, ap.id, state.playedCard);
    }
    delete state.playedCard;
  }
}

export function putUnitIntoPlay(state, playerId, card) {
  const newUnit = createUnit(state, playerId, card);
  forEach(newUnit.current.abilities, a => {
    if (a.triggerOnOwnArrival) {
      state.newTriggers.push({
        path: a.path,
        sourceId: newUnit.id
      });
    }
  });
  return newUnit;
}
