import { types } from "./cardinfo/constants";
import CodexGame from "./game";
import {
  createHero,
  updateCurrentValues,
  createBuildingFixture,
  createOngoingSpell,
  createEntity
} from "./entities";
import { fixtureNames } from "./fixtures";
import {
  getLegalChoicesForCurrentTrigger,
  currentStepDefinition
} from "./triggers";
import cardInfo from "./cardinfo";

import every from "lodash/every";
import isArray from "lodash/isArray";
import isBoolean from "lodash/isBoolean";
import isNull from "lodash/isNull";
import isNumber from "lodash/isNumber";
import isUndefined from "lodash/isUndefined";
import isPlainObject from "lodash/isPlainObject";
import isString from "lodash/isString";
import overSome from "lodash/overSome";
import pickBy from "lodash/pickBy";
import produce from "immer";
import { buildSingleCodex } from "./codex";

export const testp1Id = "test_player1";
export const testp2Id = "test_player2";

function isSerializable(obj) {
  const innerIsSerializable = o =>
    (isPlainObject(o) || isArray(o)) && every(o, isSerializable);
  return overSome([
    isUndefined,
    isNull,
    isBoolean,
    isNumber,
    isString,
    innerIsSerializable
  ])(obj);
}

function throwIfUnserializable(obj, initialPath) {
  const path = initialPath || "";
  if (isPlainObject(obj) || isArray(obj)) {
    return every(obj, (v, k) => throwIfUnserializable(v, `${path}.${k}`));
  }
  if (overSome([isUndefined, isNull, isBoolean, isNumber, isString])(obj)) {
    return true;
  }
  throw new Error(`Unserializable value at state${path}`);
}

export function getNewGame() {
  const playerList = [testp1Id, testp2Id];
  const { state } = CodexGame.playAction(
    { playerList },
    { type: "start", specs: { [testp1Id]: [], [testp2Id]: [] } }
  );
  return state;
}

// Currently just an alias, but we might want to expand on this
export const getTestGame = getNewGame;

export function putCardInHand(state, player, card) {
  state.players[player].hand.push(card);
}

export function withCardsInHand(state, p1cards, p2cards) {
  return produce(state, draft => {
    p1cards.forEach(c => draft.players[testp1Id].hand.push(c));
    p2cards.forEach(c => draft.players[testp2Id].hand.push(c));
  });
}

export function withInsertedEntity(state, owner, card) {
  let newId = null;
  const newState = produce(state, draft => {
    switch (cardInfo[card].type) {
      case types.unit:
        newId = createEntity(draft, owner, card).id;
        break;
      case types.hero:
        newId = createHero(draft, owner, card).id;
        break;
    }
  });
  return [newState, newId];
}

export function withInsertedEntities(state, owner, cards) {
  let newIds = [];
  let newState = state;
  let latestId = null;
  cards.forEach(c => {
    [newState, latestId] = withInsertedEntity(newState, owner, c);
    newIds.push(latestId);
  });
  return [newState, newIds];
}

export function withGoldSetTo(state, playerId, amount) {
  return produce(state, draft => {
    draft.players[playerId].gold = amount;
  });
}

export function getGameWithUnits(p1units, p2units) {
  const tg = new TestGame();
  p1units.forEach(u => tg.insertEntity(testp1Id, u));
  p2units.forEach(u => tg.insertEntity(testp2Id, u));
  tg.playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  return tg.state;
}

export function playActions(initialState, actionList) {
  let state = initialState;
  actionList.forEach(a => {
    CodexGame.checkAction(state, a);
    ({ state } = CodexGame.playAction(state, a));
    if (state.log.length == 0) {
      throw new Error(
        "Last action produced an empty log: " + JSON.stringify(a)
      );
    }
    if (state.currentTrigger !== null) {
      const stepDef = currentStepDefinition(state);
      if (stepDef.prompt === undefined) {
        throw new Error(
          "Currently-resolving trigger has no prompt: " +
            JSON.stringify(state.currentTrigger)
        );
      }
    }
    throwIfUnserializable(state);
  });
  return state;
}

export function findEntityIds(state, predicate) {
  return Object.keys(pickBy(state.entities, predicate));
}

export function findTriggerIndices(state, predicate) {
  return Object.keys(pickBy(state.newTriggers, predicate)).map(Number);
}

export class TestGame {
  constructor(state) {
    this.state = state || getTestGame();
    this.insertedEntityIds = [];
  }
  findBaseId(playerId) {
    return Object.keys(
      pickBy(
        this.state.entities,
        e => e.fixture == fixtureNames.base && e.owner == playerId
      )
    )[0];
  }
  findTriggerIndex(predicate) {
    return Object.keys(pickBy(this.state.newTriggers, predicate)).map(
      Number
    )[0];
  }
  getLegalChoices() {
    return getLegalChoicesForCurrentTrigger(this.state);
  }
  setGold(playerId, amount) {
    this.state = produce(this.state, draft => {
      draft.players[playerId].gold = amount;
    });
    return this;
  }
  setWorkers(playerId, amount) {
    this.state = produce(this.state, draft => {
      draft.players[playerId].workers = amount;
    });
    return this;
  }
  putHeroInCommandZone(playerId, hero) {
    this.state = produce(this.state, draft => {
      draft.players[playerId].commandZone.push(hero);
    });
    return this;
  }
  putCardsInHand(playerId, cards) {
    this.state = produce(this.state, draft => {
      cards.forEach(c => draft.players[playerId].hand.push(c));
    });
    return this;
  }
  putCardsOnTopOfDeck(playerId, cards) {
    this.state = produce(this.state, draft => {
      cards.forEach(c => draft.players[playerId].deck.unshift(c));
    });
    return this;
  }
  setCodex(playerId, codex) {
    this.state = produce(this.state, draft => {
      draft.players[playerId].codex = codex;
    });
    return this;
  }
  setCodexBySpec(playerId, spec) {
    this.setCodex(playerId, buildSingleCodex(spec));
    return this;
  }
  insertFixture(playerId, fixture) {
    let newId = null;
    const newState = produce(this.state, draft => {
      newId = createBuildingFixture(draft, playerId, fixture).id;
    });
    this.state = newState;
    this.insertedEntityIds.push(newId);
    return this;
  }
  insertEntity(playerId, card) {
    let newId = null;
    const newState = produce(this.state, draft => {
      draft.updateHidden = func => func(draft);
      switch (cardInfo[card].type) {
        case types.unit:
        case types.upgrade:
          newId = createEntity(draft, playerId, card).id;
          break;
        case types.hero:
          newId = createHero(draft, playerId, card).id;
          break;
        case types.spell:
          newId = createOngoingSpell(draft, playerId, card).id;
          break;
      }
      delete draft.updateHidden;
    });
    this.state = newState;
    this.insertedEntityIds.push(newId);
    return this;
  }
  insertEntities(playerId, cards) {
    cards.forEach(c => this.insertEntity(playerId, c));
    return this;
  }
  modifyEntity(entityId, props) {
    const newState = produce(this.state, draft => {
      draft.entities[entityId] = { ...draft.entities[entityId], ...props };
      updateCurrentValues(draft);
    });
    this.state = newState;
    return this;
  }
  queueByPath(path) {
    const index = this.findTriggerIndex(t => t.path == path);
    return this.playAction({ type: "queue", index });
  }
  checkAction(action) {
    return CodexGame.checkAction(this.state, action);
  }
  playAction(action) {
    this.state = playActions(this.state, [action]);
    return this;
  }
  playActions(actions) {
    this.state = playActions(this.state, actions);
    return this;
  }
}
