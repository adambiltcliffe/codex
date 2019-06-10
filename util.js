export function getAPid(state) {
  return state.playerList[state.activePlayerIndex];
}
export function getAP(state) {
  return state.players[getAPid(state)];
}
