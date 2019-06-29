import { getAP } from "../util";
import cardInfo, { types } from "../cardinfo";
import log from "../log";
import { killUnits, getCurrentValues } from "../entities";
import { hasKeyword, haste } from "../cardinfo/keywords";

export function checkAttackAction(state, action) {
  const ap = getAP(state);
  const attacker = state.entities[action.attacker];
  if (typeof attacker != "object") {
    throw new Error("Invalid attacker ID.");
  }
  const attackerVals = getCurrentValues(state, attacker.id);
  if (attackerVals.controller != ap.id) {
    throw new Error("You don't control the attacker.");
  }
  if (attackerVals.type != types.unit) {
    throw new Error("Only units can attack.");
  }
  if (
    attacker.controlledSince == state.turn &&
    !hasKeyword(attackerVals, haste)
  ) {
    throw new Error("Attacker has arrival fatigue.");
  }
  if (!attacker.ready) {
    throw new Error("Attacker is exhausted.");
  }
  const target = state.entities[action.target];
  if (typeof target != "object") {
    throw new Error("Invalid target ID.");
  }
  const targetVals = getCurrentValues(state, target.id);
  if (targetVals.controller == ap.id) {
    throw new Error("Can't attack your own unit.");
  }
  return true;
}

export function doAttackAction(state, action) {
  const attacker = state.entities[action.attacker];
  const target = state.entities[action.target];
  const values = getCurrentValues(state, [attacker.id, target.id]);
  const attackerValues = values[attacker.id];
  const targetValues = values[target.id];
  log.add(
    state,
    log.fmt`${getAP(state)} attacks ${targetValues.name} with ${
      attackerValues.name
    }.`
  );
  attacker.ready = false;
  attacker.damage += targetValues.attack;
  target.damage += attackerValues.attack;
  killUnits(state);
}
