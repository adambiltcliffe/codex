import { getAP } from "../util";
import cardInfo from "../cardinfo";
import log from "../log";
import { getCurrentValues, getName } from "../entities";
import forEach from "lodash/forEach";

export function checkSummonAction(state, action) {
  const ap = getAP(state);
  if (!ap.commandZone.includes(action.hero)) {
    throw new Error("Hero not in command zone");
  }
  if (ap.gold < cardInfo[action.hero].cost) {
    throw new Error("Not enough gold");
  }
}

export function doSummonAction(state, action) {
  const ap = getAP(state);
  const czIndex = ap.commandZone.indexOf(action.hero);
  ap.commandZone.splice(czIndex, 1);
  ap.gold -= cardInfo[action.hero].cost;
  const newHero = {
    id: `e${state.nextId}`,
    card: action.hero,
    owner: getAP(state).id,
    lastControlledBy: getAP(state).id,
    controlledSince: state.turn,
    ready: true,
    damage: 0,
    runes: 0,
    level: 1,
    thisTurn: {}
  };
  state.entities[newHero.id] = newHero;
  state.nextId++;
  log.add(state, log.fmt`${ap} summons ${getName(state, newHero.id)}.`);
  const vals = getCurrentValues(state, newHero.id);
  forEach(vals.abilities, a => {
    if (a.triggerOnOwnArrival) {
      state.newTriggers.push({
        path: a.path,
        sourceId: newHero.id
      });
    }
  });
}
