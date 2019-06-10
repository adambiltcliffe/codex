import { getAP, getAPid } from "../util";
import cardInfo from "../cardinfo";

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
  console.log(cardInfo[state.playedCard]);
  ap.gold -= cardInfo[state.playedCard].cost;

  const newUnit = {
    id: state.nextUnitId,
    card: state.playedCard,
    controller: getAPid(state)
  };

  ap.units.push(newUnit);
  delete state.playedCard;
  state.nextUnitId++;
}
