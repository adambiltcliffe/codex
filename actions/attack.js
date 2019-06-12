import { getAP } from "../util";
import cardInfo from "../cardinfo";
import log from "../log";

export function checkAttackAction(state, action) {
  const ap = getAP(state);
  const attacker = state.units[action.attacker];
  if (typeof attacker != "object") {
    throw new Error("Invalid attacker ID.");
  }
  if (attacker.controller != ap.id) {
    throw new Error("You don't control the attacker.");
  }
  if (attacker.controlledSince == state.turn) {
    throw new Error("Attacker has arrival fatigue.");
  }
  if (!attacker.ready) {
    throw new Error("Attacker is exhausted.");
  }
  const target = state.units[action.target];
  if (typeof target != "object") {
    throw new Error("Invalid target ID.");
  }
  if (target.controller == ap.id) {
    throw new Error("Can't attack your own unit.");
  }
  return true;
}

export function doAttackAction(state, action) {
  const attacker = state.units[action.attacker];
  const target = state.units[action.target];
  log.add(
    state,
    log.fmt`${getAP(state)} attacks ${cardInfo[target.card].name} with ${
      cardInfo[attacker.card].name
    }.`
  );
  attacker.damage += cardInfo[target.card].attack;
  target.damage += cardInfo[attacker.card].attack;
  if (target.damage >= cardInfo[target.card].hp) {
    log.add(state, log.fmt`${cardInfo[target.card].name} dies.`);
    delete state.units[target.id];
    state.updateHidden(fs => {
      fs.players[target.owner].discard.push(target.card);
    });
  }
  if (attacker.damage >= cardInfo[attacker.card].hp) {
    log.add(state, log.fmt`${cardInfo[attacker.card].name} dies.`);
    delete state.units[attacker.id];
    state.updateHidden(fs => {
      fs.players[attacker.owner].discard.push(attacker.card);
    });
  } else {
    attacker.ready = false;
  }
}
