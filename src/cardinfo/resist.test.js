import cardInfo from ".";
import { colors, types } from "./constants";
import { resist } from "./keywords";
import {
  getGameWithUnits,
  findEntityIds,
  playActions,
  testp1Id
} from "../testutil";
import produce from "immer";

beforeAll(() => {
  cardInfo["_test_resist"] = {
    color: colors.neutral,
    tech: 0,
    name: "Test Unit (Resist)",
    type: types.unit,
    cost: 2,
    attack: 2,
    hp: 2,
    abilities: [resist(1)]
  };
});

test("Must pay extra when targetting opposing unit with resist", () => {
  const s0 = getGameWithUnits([], ["_test_resist"]);
  const tr = findEntityIds(s0, e => e.card == "_test_resist")[0];
  const s1 = produce(s0, d => {
    d.players[testp1Id].hand.push("hired_stomper");
  });
  const s2 = playActions(s1, [
    { type: "play", card: "hired_stomper" },
    { type: "choice", target: tr }
  ]);
  expect(s2.players[testp1Id].gold).toEqual(3);
});

test("Don't need to pay for resist when targetting own unit", () => {
  const s0 = getGameWithUnits(["_test_resist"], []);
  const tr = findEntityIds(s0, e => e.card == "_test_resist")[0];
  const s1 = produce(s0, d => {
    d.players[testp1Id].hand.push("hired_stomper");
  });
  const s2 = playActions(s1, [
    { type: "play", card: "hired_stomper" },
    { type: "choice", target: tr }
  ]);
  expect(s2.players[testp1Id].gold).toEqual(4);
});

test("Can't target a resist unit without gold to pay for it", () => {
  const s0 = getGameWithUnits([], ["_test_resist"]);
  const tr = findEntityIds(s0, e => e.card == "_test_resist")[0];
  const s1 = produce(s0, d => {
    d.players[testp1Id].hand.push("hired_stomper");
    d.players[testp1Id].gold = 4;
  });
  const s2 = playActions(s1, [{ type: "play", card: "hired_stomper" }]);
  expect(() => {
    CodexGame.checkAction(s2, { type: "choice", target: tr });
  }).toThrow();
});
