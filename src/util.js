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
