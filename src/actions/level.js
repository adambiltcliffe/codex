import { types } from "../cardinfo";
import { getAP } from "../util";
import log from "../log";
import { getCurrentValues, getName } from "../entities";

export function checkLevelAction(state, action) {
  const ap = getAP(state);
  if (typeof action.hero != "string") {
    throw new Error("Hero ID must be a string");
  }
  const hero = state.entities[action.hero];
  if (typeof hero != "object") {
    throw new Error("Invalid entity ID.");
  }
  const heroVals = getCurrentValues(state, hero.id);
  if (heroVals.type != types.hero) {
    throw new Error("Chosen entity isn't a hero.");
  }
  if (heroVals.controller != ap.id) {
    throw new Error("You don't control that hero.");
  }
  if (!Number.isInteger(action.amount) || action.amount < 1) {
    throw new Error("Invalid number of levels.");
  }
  if (action.amount > ap.gold) {
    throw new Error("You don't have that much gold.");
  }
  if (
    state.entities[action.hero].level + action.amount >
    heroVals.maxbandLevel
  ) {
    throw new Error("Hero would exceed max level.");
  }
}

export function doLevelAction(state, action) {
  const ap = getAP(state);
  const hero = state.entities[action.hero];
  const heroVals = getCurrentValues(state, hero.id);
  const oldLevel = hero.level;
  ap.gold -= action.amount;
  hero.level += action.amount;
  log.add(
    state,
    log.fmt`${ap} raises ${getName(state, hero.id)} to level ${hero.level}.`
  );
  if (
    ((oldLevel < heroVals.midbandLevel &&
      hero.level >= heroVals.midbandLevel) ||
      (oldLevel < heroVals.maxbandLevel &&
        hero.level == heroVals.maxbandLevel)) &&
    hero.damage > 0
  ) {
    hero.damage = 0;
    log.add(state, log.fmt`${getName(state, hero.id)} is fully healed.`);
  }
}
