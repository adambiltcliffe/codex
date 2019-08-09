import { getAP } from "../util";
import cardInfo from "../cardinfo";
import log from "../log";
import {
  getCurrentValues,
  createUnit,
  getName,
  updateCurrentValues,
  applyStateBasedEffects
} from "../entities";
import { types, colors } from "../cardinfo/constants";
import { addSpellToQueue } from "../triggers";

import findIndex from "lodash/findIndex";
import forEach from "lodash/forEach";
import filter from "lodash/filter";

function getHeroColors(state) {
  return filter(
    getCurrentValues(state, Object.keys(state.entities)),
    v => v.controller == getAP(state).id && v.type == types.hero
  ).map(v => v.color);
}

function getHeroSpecs(state) {
  return filter(
    getCurrentValues(state, Object.keys(state.entities)),
    v => v.controller == getAP(state).id && v.type == types.hero
  ).map(v => v.spec);
}

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
    if (!getHeroColors(state).includes(cardInfo.color)) {
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
  const heroSpecs = getHeroSpecs(state);
  if (
    ci.type == types.spell &&
    ((!ci.minor && !heroSpecs.includes(ci.spec)) || heroSpecs.length == 0)
  ) {
    throw new Error("Don't have the right hero to cast that spell");
  }
}

export function doPlayAction(state, action) {
  state.updateHidden(fs => {
    const ap = getAP(fs);
    const handIndex = ap.hand.indexOf(action.card);
    fs.playedCard = ap.hand.splice(handIndex, 1)[0];
  });
  const ap = getAP(state);
  ap.gold -= getPlayCost(state, cardInfo[action.card]);
  if (cardInfo[state.playedCard].type == types.spell) {
    playSpell(state);
  } else {
    playUnit(state);
  }
}

function playSpell(state) {
  const ci = cardInfo[state.playedCard];
  log.add(state, log.fmt`${getAP(state)} plays ${ci.name}.`);
  const spellEffectIndex = findIndex(ci.abilities, a => a.isSpellEffect);
  addSpellToQueue(state, {
    path: `cardInfo.${state.playedCard}.abilities[${spellEffectIndex}]`,
    isSpell: true
  });
}

function playUnit(state) {
  const ap = getAP(state);
  const newUnit = createUnit(state, ap.id, state.playedCard);
  delete state.playedCard;
  log.add(state, log.fmt`${ap} plays ${newUnit.current.name}.`);
  forEach(newUnit.current.abilities, a => {
    if (a.triggerOnOwnArrival) {
      state.newTriggers.push({
        path: a.path,
        sourceId: newUnit.id
      });
    }
  });
}
