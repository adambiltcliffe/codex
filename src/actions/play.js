import { getAP } from "../util";
import cardInfo from "../cardinfo";
import log from "../log";
import { getCurrentValues, createUnit, getName } from "../entities";
import findIndex from "lodash/findIndex";
import forEach from "lodash/forEach";
import { types } from "../cardinfo/constants";
import { addSpellToQueue } from "../triggers";

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
  return currentCost;
}

export function checkPlayAction(state, action) {
  const ap = getAP(state);
  if (ap.hand.indexOf(action.card) == -1) {
    throw new Error("Card not in hand");
  }
  if (ap.gold < getPlayCost(state, cardInfo[action.card])) {
    throw new Error("Not enough gold");
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
    path: `${state.playedCard}.abilities[${spellEffectIndex}]`,
    isSpell: true
  });
}

function playUnit(state) {
  const ap = getAP(state);
  const newUnitId = createUnit(state, ap.id, state.playedCard);
  delete state.playedCard;
  const vals = getCurrentValues(state, newUnitId);
  log.add(state, log.fmt`${ap} plays ${getName(state, newUnitId)}.`);
  forEach(vals.abilities, a => {
    if (a.triggerOnOwnArrival) {
      state.newTriggers.push({
        path: a.path,
        sourceId: newUnitId
      });
    }
  });
}
