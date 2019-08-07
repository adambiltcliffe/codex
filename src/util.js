export function getAP(state) {
  return state.players[state.playerList[state.activePlayerIndex]];
}

export function andJoin(strings) {
  if (strings.length === 1) {
    return strings[0];
  } else if (strings.length === 2) {
    return strings.join(" and ");
  } else {
    return strings.slice(0, -1).join(", ") + " and " + strings.slice(-1);
  }
}

export function andJoinVerb(strings, singular, plural) {
  if (strings.length == 1) {
    return `${strings[0]} ${singular}`;
  } else {
    return `${andJoin(strings)} ${plural}`;
  }
}

export function givePlayerGold(state, playerId, amount) {
  const p = state.players[playerId];
  const oldGold = p.gold;
  p.gold += amount;
  if (p.gold > 20) {
    p.gold = 20;
  }
  return p.gold - oldGold;
}
