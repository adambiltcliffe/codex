import {
  getGameWithUnits,
  findEntityIds,
  playActions,
  testp1Id
} from "../testutil";
import produce from "immer";

test("Merfolk Prospector can produce gold", () => {
  const s0 = getGameWithUnits(["merfolk_prospector"], []);
  const mp = findEntityIds(s0, e => e.card == "merfolk_prospector")[0];
  expect(s0.players[testp1Id].gold).toEqual(8);
  const s1 = playActions(s0, [{ type: "activate", source: mp, index: 0 }]);
  expect(s1.players[testp1Id].gold).toEqual(9);
  expect(s1.log).toContain("Merfolk Prospector produces 1 gold.");
  const s0a = produce(s0, d => {
    d.players[testp1Id].gold = 20;
  });
  const s1a = playActions(s0a, [{ type: "activate", source: mp, index: 0 }]);
  expect(s1a.players[testp1Id].gold).toEqual(20);
  expect(s1a.log).toContain("Merfolk Prospector produces 0 gold.");
});
