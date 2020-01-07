import { getAP } from "./util";

import forEach from "lodash/forEach";
import { attachEffectThisTurn, expireEffectsOnEntity } from "./effects";

import { patrolSlots, patrolSlotNames } from "./cardinfo/constants";
// Eventually get rid of this re-export
export { patrolSlots, patrolSlotNames };

export const emptyPatrolZone = [null, null, null, null, null];

export function sideline(state, patroller) {
  const slot = patroller.current.patrolSlot;
  if (slot !== null) {
    state.players[patroller.current.controller].patrollerIds[slot] = null;
  }
  expireEffectsOnEntity(state, patroller);
}

export function changePatrolSlot(state, patroller, newIndex) {
  const slot = patroller.current.patrolSlot;
  if (slot !== null) {
    state.players[patroller.current.controller].patrollerIds[slot] = null;
    state.players[patroller.current.controller].patrollerIds[newIndex] =
      patroller.id;
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
