import { knuthShuffle } from "knuth-shuffle";
import { enterReadyPhase } from "../phases";
import log from "../log";
import { fixtureNames } from "../fixtures";
import { emptyPatrolZone } from "../patrolzone";
import { updateCurrentValues, createBuildingFixture } from "../entities";
import {
  playableSpecs,
  buildStarterDeck,
  buildSingleCodex,
  getHero
} from "../codex";
import flatMap from "lodash/flatMap";
import uniq from "lodash/uniq";
import { colors, specColors } from "../cardinfo";

function initialisePlayerState(state, playerIndex, playerSpecs) {
  const player = state.playerList[playerIndex];
  const starterColor = specColors[playerSpecs[0]] || colors.neutral;
  const uniqueSpecs = uniq(playerSpecs);
  state.updateHidden(fs => {
    const deck = buildStarterDeck(starterColor);
    knuthShuffle(deck);
    const hand = deck.splice(0, 5);
    fs.players[player] = {
      hand,
      deck,
      discard: [],
      codex: flatMap(uniqueSpecs, buildSingleCodex)
    };
  });
  state.players[player].id = player;
  state.players[player].workers = playerIndex == 0 ? 4 : 5;
  state.players[player].gold = 0;
  state.players[player].paidFixtures = [];
  state.players[player].patrollerIds = emptyPatrolZone;
  state.players[player].commandZone = uniqueSpecs.map(s => getHero(s));
  state.players[player].heroCooldowns = {};
  state.players[player].mustTech = false;
  createBuildingFixture(state, player, fixtureNames.base, true);
}

export function checkStartAction(state, action) {
  if (state.started) {
    throw new Error("Game already started");
  }
  if (action.specs === undefined) {
    throw new Error("Players' chosen specs not specified");
  }
  state.playerList.forEach(p => {
    if (!Array.isArray(action.specs[p])) {
      throw new Error(`No spec array given for player ${p}`);
    }
    action.specs[p].forEach(s => {
      if (!playableSpecs.includes(s)) {
        throw new Error(`${s} is not a playable spec`);
      }
    });
  });
}

export function doStartAction(state, action) {
  state.started = true;
  state.nextId = 1;
  state.activePlayerIndex = 0;
  state.players = {};
  state.entities = {};
  for (let ii = 0; ii < state.playerList.length; ii++) {
    initialisePlayerState(state, ii, action.specs[state.playerList[ii]]);
  }
  state.turn = 0;
  state.queue = [];
  state.currentTrigger = null;
  state.currentAttack = null;
  state.newTriggers = [];
  log.add(state, "Game started.");
  updateCurrentValues(state);

  enterReadyPhase(state);
}
