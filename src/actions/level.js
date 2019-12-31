import { types } from "../cardinfo";
import { getAP } from "../util";
import log from "../log";
import { getCurrentValues, applyStateBasedEffects } from "../entities";

export function checkLevelAction(state, action) {
  const ap = getAP(state);
  if (typeof action.hero != "string") {
    throw new Error("Hero ID must be a string");
  }
  const hero = state.entities[action.hero];
  if (typeof hero != "object") {
    throw new Error("Invalid entity ID.");
  }
  if (hero.current.type != types.hero) {
    throw new Error("Chosen entity isn't a hero.");
  }
  if (hero.current.controller != ap.id) {
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
    hero.current.maxbandLevel
  ) {
    throw new Error("Hero would exceed max level.");
  }
  return true;
}

export function doLevelAction(state, action) {
  const ap = getAP(state);
  const hero = state.entities[action.hero];
  const oldLevel = hero.level;
  ap.gold -= action.amount;
  hero.level += action.amount;
  log.add(
    state,
    log.fmt`${ap} raises ${hero.current.name} to level ${hero.level}.`
  );
  if (
    ((oldLevel < hero.current.midbandLevel &&
      hero.level >= hero.current.midbandLevel) ||
      (oldLevel < hero.current.maxbandLevel &&
        hero.level == hero.current.maxbandLevel)) &&
    hero.damage > 0
  ) {
    hero.damage = 0;
    log.add(state, log.fmt`${hero.current.name} is fully healed.`);
  }
  if (
    oldLevel < hero.current.maxbandLevel &&
    hero.level == hero.current.maxbandLevel
  ) {
    hero.maxedSince = state.turn;
  }
  applyStateBasedEffects(state);
}
