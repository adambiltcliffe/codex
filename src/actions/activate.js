import { killEntity, getAbilityDefinition, exhaustEntity } from "../entities";
import { hasKeyword, haste } from "../cardinfo/abilities/keywords";
import { getAP } from "../util";
import log from "../log";
import { createTrigger } from "../triggers";

export function checkActivateAction(state, action) {
  const ap = getAP(state);
  if (typeof action.source != "string") {
    throw new Error("Source entity ID must be a string");
  }
  const source = state.entities[action.source];
  if (typeof source != "object") {
    throw new Error("Invalid source entity ID.");
  }
  if (source.current.controller != ap.id) {
    throw new Error("You don't control the source entity.");
  }
  const abilityDef = getAbilityDefinition(
    source.current.abilities[action.index]
  );
  if (typeof abilityDef != "object") {
    throw new Error("Invalid ability index");
  }
  if (!abilityDef.isActivatedAbility) {
    throw new Error("Can't activate that ability");
  }
  if (abilityDef.costsExhaustSelf) {
    if (
      source.controlledSince == state.turn &&
      !hasKeyword(source.current, haste)
    ) {
      throw new Error("Source entity has arrival fatigue.");
    }
    if (!source.ready) {
      throw new Error("Source entity is exhausted.");
    }
  }
  if (abilityDef.costsNamedRunes) {
    Object.entries(abilityDef.costsNamedRunes).forEach(([rune, count]) => {
      if (
        source.namedRunes[rune] === undefined ||
        source.namedRunes[rune] < count
      ) {
        throw new Error(`Not enough ${rune} runes.`);
      }
    });
  }
  return true;
}

export function doActivateAction(state, action) {
  const source = state.entities[action.source];
  const ability = source.current.abilities[action.index];
  createTrigger(state, {
    path: ability.path,
    sourceId: source.id,
    isActivatedAbility: true
  });
  const ad = getAbilityDefinition(ability);
  if (ad.costsExhaustSelf) {
    exhaustEntity(state, source.id);
  }
  if (ad.costsNamedRunes) {
    Object.entries(ad.costsNamedRunes).forEach(([rune, count]) => {
      source.namedRunes[rune] -= count;
    });
  }
  log.add(
    state,
    log.fmt`${getAP(state)} activates an ability of ${source.current.name}.`
  );
  if (ad.costsSacrificeSelf) {
    killEntity(state, source.id, { verb: "is sacrificed" });
  }
}
