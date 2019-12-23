import cardInfo from "./cardinfo";
import log from "./log";

import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import partition from "lodash/partition";
import pick from "lodash/pick";
import sum from "lodash/sum";
import upperFirst from "lodash/upperFirst";
import { andJoin } from "./util";
import { getAbilityDefinition } from "./entities";
import { createTrigger } from "./triggers";

export function queueDamage(state, damage) {
  if (damage.amount < 1) {
    return;
  }
  if (damage.isSpellDamage) {
    damage.sourceCard = state.playedCard;
  }
  state.pendingDamage.push(damage);
}

export function applyPendingDamage(state) {
  if (state.pendingDamage.length == 0) {
    return;
  }
  describeDamageAndQueueTriggers(state);
  state.pendingDamage.forEach(d => describeDamagePacket(state, d));
  const packetsPerSource = groupBy(state.pendingDamage, "sourceId");
  const damagePerSubject = mapValues(
    groupBy(state.pendingDamage, "subjectId"),
    packets => sum(packets.map(p => p.amount))
  );
  const killedEntityIds = Object.values(state.entities)
    .filter(e => {
      return (
        damagePerSubject[e.id] !== undefined &&
        damagePerSubject[e.id] + e.damage >= e.current.hp + e.armor
      );
    })
    .map(e => e.id);
  Object.keys(packetsPerSource).forEach(id => {
    const e = state.entities[id];
    if (e !== undefined) {
      e.current.abilities.forEach(a => {
        const ad = getAbilityDefinition(a);
        if (ad.triggerOnDamageEntity) {
          packetsPerSource[id].forEach(packet => {
            const isLethal = killedEntityIds.includes(packet.subjectId);
            if (
              !ad.shouldTrigger ||
              ad.shouldTrigger({ state, packet, isLethal })
            ) {
              createTrigger(state, {
                path: a.path,
                isLethal,
                subjectController:
                  state.entities[packet.subjectId].current.controller
              });
            }
          });
        }
      });
    }
  });
  state.pendingDamage.forEach(d => applyDamagePacket(state, d));
  state.pendingDamage = [];
}

function describeDamageAndQueueTriggers(state) {
  const [spellDamage, entityDamage] = partition(
    state.pendingDamage,
    "isSpellDamage"
  );
  const bySourceCard = groupBy(spellDamage, "sourceCard");
  Object.entries(bySourceCard).forEach(([card, packets]) => {
    log.add(
      state,
      `${upperFirst(cardInfo[card].name)} deals ${andJoin(
        packets.map(p => describeDamagePacket(state, p))
      )}.`
    );
  });
  const bySourceId = groupBy(entityDamage, "sourceId");
  Object.entries(bySourceId).forEach(([id, packets]) => {
    const source = state.entities[id];
    log.add(
      state,
      `${upperFirst(source.current.name)} deals ${andJoin(
        packets.map(p => describeDamagePacket(state, p))
      )}.`
    );
  });
}

function describeDamagePacket(state, damage) {
  const subject = state.entities[damage.subjectId];
  const packetText = damage.tag
    ? `${damage.amount} ${damage.tag} damage`
    : `${damage.amount} damage`;
  if (damage.sourceId && damage.sourceId == subject.id) {
    return `${packetText} to itself`;
  } else {
    return `${packetText} to ${subject.current.name}`;
  }
}

function applyDamagePacket(state, damage) {
  const subject = state.entities[damage.subjectId];
  const source = state.entities[damage.sourceId];
  if (damage.amount > subject.armor) {
    subject.damage += damage.amount - subject.armor;
    subject.armor = 0;
  } else {
    subject.armor -= damage.amount;
  }
}
