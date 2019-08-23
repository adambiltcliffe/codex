import { colors, types } from "../constants";
import { triggerDefinitions } from "../../triggers";
import { resist } from "./keywords";
import {
  getGameWithUnits,
  findEntityIds,
  playActions,
  testp1Id,
  TestGame,
  testp2Id
} from "../../testutil";
import produce from "immer";
import { fixtureNames } from "../../fixtures";

beforeAll(() => {
  triggerDefinitions.cardInfo["_test_resist"] = {
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
  const s0 = new TestGame()
    .setGold(testp1Id, 5)
    .insertEntity(testp2Id, "_test_resist")
    .insertFixture(testp1Id, fixtureNames.tech2).state;
  const tr = findEntityIds(s0, e => e.card == "_test_resist")[0];
  const s1 = produce(s0, d => {
    d.players[testp1Id].hand.push("hired_stomper");
  });
  const s2 = playActions(s1, [{ type: "play", card: "hired_stomper" }]);
  expect(s2.players[testp1Id].gold).toEqual(1);
  const s3 = playActions(s2, [{ type: "choice", target: tr }]);
  expect(s3.players[testp1Id].gold).toEqual(0);
});

test("Don't need to pay for resist when targetting own unit", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "_test_resist")
    .insertFixture(testp1Id, fixtureNames.tech2)
    .putCardsInHand(testp1Id, ["hired_stomper"])
    .setGold(testp1Id, 4);
  const [tr] = tg.insertedEntityIds;
  const s2 = playActions(tg.state, [
    { type: "play", card: "hired_stomper" },
    { type: "choice", target: tr }
  ]);
  expect(s2.players[testp1Id].gold).toEqual(0);
});

test("Can't target a resist unit without gold to pay for it", () => {
  const s0 = new TestGame()
    .insertFixture(testp1Id, fixtureNames.tech2)
    .insertEntity(testp2Id, "_test_resist").state;
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
