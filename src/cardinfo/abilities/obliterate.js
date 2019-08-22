import { killEntity } from "../../entities";
import { targetMode, types } from "../constants";

import sortBy from "lodash/sortBy";
import log from "../../log";
import { andJoinVerb } from "../../util";

export function getObliterateTargets(state, playerId, n) {
  const defendersUnits = Object.values(state.entities).filter(
    e => e.current.type == types.unit && e.current.controller == playerId
  );
  return partitionObliterateTargets(defendersUnits, n);
}

export function partitionObliterateTargets(units, n) {
  const possibleVictims = sortBy(units, ["current.tech"]);
  let definitely = [];
  let maybe = [];
  let found = 0;
  let currentTech = 0;
  for (let index = 0; index < possibleVictims.length; index++) {
    const v = possibleVictims[index];
    if (v.current.tech > currentTech) {
      if (found >= n) {
        break;
      }
      definitely = definitely.concat(maybe);
      maybe = [];
      currentTech = v.current.tech;
    }
    maybe.push(v);
    found++;
  }
  if (found > n) {
    return [definitely, maybe];
  }
  return [definitely.concat(maybe), []];
}

export const obliterate = n => ({
  triggerOnAttack: true,
  targetMode: targetMode.obliterate,
  targetCount: n,
  action: ({ state, source, choices }) => {
    const dpId = state.currentAttack.defendingPlayer;
    const [definitely, maybe] = getObliterateTargets(state, dpId, n);
    const victims = definitely.concat(
      (choices.targetIds || []).map(id => state.entities[id])
    );
    const message =
      victims.length > 0
        ? `${andJoinVerb(
            victims.map(v => v.current.name),
            "is",
            "are"
          )} obliterated.`
        : "No units exist to be obliterated.";
    log.add(state, message);
    victims.forEach(v => killEntity(state, v.id));
  }
});
