import { getAP } from "../util";
import cardInfo from "../cardinfo";
import log from "../log";
import { getCurrentValues } from "../entities";
import findIndex from "lodash/findIndex";
import forEach from "lodash/forEach";
import { types } from "../cardinfo/constants";
import { addSpellToQueue } from "../triggers";

export function checkPlayAction(state, action) {
  const ap = getAP(state);
  if (ap.hand.indexOf(action.card) == -1) {
    throw new Error("Card not in hand");
  }
  if (ap.gold < cardInfo[action.card].cost) {
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
  ap.gold -= cardInfo[state.playedCard].cost;
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
  const newUnit = {
    id: `e${state.nextId}`,
    card: state.playedCard,
    owner: getAP(state).id,
    lastControlledBy: getAP(state).id,
    controlledSince: state.turn,
    ready: true,
    damage: 0,
    runes: 0,
    thisTurn: {}
  };

  state.entities[newUnit.id] = newUnit;
  delete state.playedCard;
  state.nextId++;
  log.add(state, log.fmt`${ap} plays ${cardInfo[newUnit.card].name}.`);

  const vals = getCurrentValues(state, newUnit.id);
  forEach(vals.abilities, (a, index) => {
    if (a.triggerOnOwnArrival) {
      state.newTriggers.push({
        path: a.path,
        sourceId: newUnit.id
      });
    }
  });
}
