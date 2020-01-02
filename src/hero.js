import log from "./log";
import { getAbilityDefinition, updateCurrentValues } from "./entities";
import { createTrigger } from "./triggers";

import clamp from "lodash/clamp";
import forEach from "lodash/forEach";

export function addLevelsToHero(state, hero, amount) {
  const oldLevel = hero.level;
  hero.level = clamp(hero.level + amount, 0, hero.current.maxbandLevel);
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
    // This isn't super efficient but probably not a big deal?
    updateCurrentValues(state);
    forEach(hero.current.abilities, a => {
      const ad = getAbilityDefinition(a);
      if (ad.triggerOnMaxLevel) {
        createTrigger(state, {
          path: a.path,
          sourceId: hero.id
        });
      }
    });
  }
}
