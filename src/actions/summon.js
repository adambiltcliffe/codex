import { getAP } from "../util";
import cardInfo from "../cardinfo";
import log from "../log";
import { createHero } from "../entities";
import forEach from "lodash/forEach";

export function checkSummonAction(state, action) {
  const ap = getAP(state);
  if (!ap.commandZone.includes(action.hero)) {
    throw new Error("Hero not in command zone");
  }
  if (ap.gold < cardInfo[action.hero].cost) {
    throw new Error("Not enough gold");
  }
  if ((ap.heroCooldowns[action.hero] || 0) > 0) {
    throw new Error("Hero is on cooldown");
  }
  return true;
}

export function doSummonAction(state, action) {
  const ap = getAP(state);
  const czIndex = ap.commandZone.indexOf(action.hero);
  ap.commandZone.splice(czIndex, 1);
  ap.gold -= cardInfo[action.hero].cost;
  const newHero = createHero(state, ap.id, action.hero);
  log.add(state, log.fmt`${ap} summons ${newHero.current.name}.`);
  forEach(newHero.current.abilities, a => {
    if (a.triggerOnOwnArrival) {
      state.newTriggers.push({
        path: a.path,
        sourceId: newHero.id
      });
    }
  });
}
