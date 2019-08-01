import { getAP } from "../util";
import cardInfo from "../cardinfo";
import log from "../log";
import { getCurrentValues, getName, createHero } from "../entities";
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
  const newHeroId = createHero(state, ap.id, action.hero);
  log.add(state, log.fmt`${ap} summons ${getName(state, newHeroId)}.`);
  const vals = getCurrentValues(state, newHeroId);
  forEach(vals.abilities, a => {
    if (a.triggerOnOwnArrival) {
      state.newTriggers.push({
        path: a.path,
        sourceId: newHeroId
      });
    }
  });
}
