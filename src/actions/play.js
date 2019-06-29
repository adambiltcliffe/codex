import { getAP } from "../util";
import cardInfo from "../cardinfo";
import log from "../log";
import { getCurrentValues } from "../entities";
import forEach from "lodash/forEach";

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

  const newUnit = {
    id: `e${state.nextId}`,
    card: state.playedCard,
    owner: getAP(state).id,
    lastControlledBy: getAP(state).id,
    controlledSince: state.turn,
    ready: true,
    damage: 0
  };

  state.entities[newUnit.id] = newUnit;
  delete state.playedCard;
  state.nextId++;
  log.add(state, log.fmt`${ap} plays ${cardInfo[newUnit.card].name}.`);

  const vals = getCurrentValues(state, newUnit.id);
  forEach(vals.abilities, (a, index) => {
    if (a.triggerOnOwnArrival) {
      state.newTriggers.push({
        card: newUnit.card,
        index,
        sourceId: newUnit.id
      });
    }
  });
}
