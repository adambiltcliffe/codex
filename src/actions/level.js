import { types } from "../cardinfo";
import { getAP } from "../util";
import log from "../log";
import { getCurrentValues, applyStateBasedEffects } from "../entities";
import { addLevelsToHero } from "../hero";

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
  ap.gold -= action.amount;
  log.add(
    state,
    log.fmt`${ap} raises ${hero.current.name} to level ${hero.level +
      action.amount}.`
  );
  addLevelsToHero(state, hero, action.amount);
  applyStateBasedEffects(state);
}
