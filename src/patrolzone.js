import { getAP } from "./util";

import forEach from "lodash/forEach";
import { attachEffectThisTurn, expireEffectsOnEntity } from "./effects";

export const patrolSlots = {
  squadLeader: 0,
  elite: 1,
  scavenger: 2,
  technician: 3,
  lookout: 4
};
export const patrolSlotNames = [
  "Squad Leader",
  "Elite",
  "Scavenger",
  "Technician",
  "Lookout"
];
export const emptyPatrolZone = [null, null, null, null, null];

export function sideline(state, patroller) {
  changePatrolSlot(state, patroller, null);
}

export function changePatrolSlot(state, patroller, newIndex) {
  const slot = patroller.current.patrolSlot;
  if (slot !== null) {
    state.players[patroller.current.controller].patrollerIds[slot] = newIndex;
  }
  expireEffectsOnEntity(state, patroller);
}

export function applyPatrolzoneEffects(state) {
  const ap = getAP(state);
  forEach(state.players, p => {
    if (p != ap.id) {
      const sqlId = p.patrollerIds[patrolSlots.squadLeader];
      if (sqlId != null) {
        attachEffectThisTurn(state, state.entities[sqlId], {
          path: "effectInfo.squadLeader",
          isPatrolZoneEffect: true
        });
      }
    }
  });
}
