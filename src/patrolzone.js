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
  expirePatrolzoneEffectsFromEntity(state, patroller);
  expireEffectsOnEntity(state, patroller);
}

export function changePatrolSlot(state, patroller, newIndex) {
  const slot = patroller.current.patrolSlot;
  if (slot !== null) {
    state.players[patroller.current.controller].patrollerIds[slot] = null;
    state.players[patroller.current.controller].patrollerIds[newIndex] =
      patroller.id;
  }
  // Moved into Squad Leader
  if (slot !== patrolSlots.squadLeader && newIndex == patrolSlots.squadLeader) {
    attachEffectThisTurn(state, patroller, {
      path: "effectInfo.squadLeader",
      isPatrolZoneEffect: true
    });
  }
  // Moved out of Squad Leader
  else if (
    slot == patrolSlots.squadLeader &&
    newIndex !== patrolSlots.squadLeader
  ) {
    forEach(patroller.effects, fx => {
      if (fx.path == "effectInfo.squadLeader") {
        fx.shouldExpire = true;
      }
    });
    expireEffectsOnEntity(state, patroller);
  }
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

function expirePatrolzoneEffectsFromEntity(state, entity) {
  forEach(entity.effects, fx => {
    // Note: we cannot use entity.current.patrolSlot as it may be out-of-date
    if (
      fx.isPatrolZoneEffect &&
      !state.players[entity.current.controller].patrollerIds.includes(entity.id)
    ) {
      fx.shouldExpire = true;
    }
  });
}
