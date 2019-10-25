import { TestGame, testp1Id } from "../testutil";
import { makeAbilityText } from "./render-entity";

test("Describing keyword abilities", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, [
    "timely_messenger",
    "fruit_ninja",
    "helpful_turtle",
    "brick_thief",
    "river_montoya",
    "harmony",
    "huntress",
    "barkcoat_bear"
  ]);
  const [tm, fn, ht, bt, river, hm, hu, bb] = tg.insertedEntityIds;
  expect(makeAbilityText(tg.state.entities[tm])).toEqual(["Haste"]);
  expect(makeAbilityText(tg.state.entities[fn])).toEqual(["Frenzy 1"]);
  expect(makeAbilityText(tg.state.entities[ht])).toEqual(["Healing 1"]);
  expect(makeAbilityText(tg.state.entities[bt])).toContain("Resist 1");
  expect(makeAbilityText(tg.state.entities[hm])).toContain("Channeling");
  expect(makeAbilityText(tg.state.entities[hu])).toEqual([
    "Sparkshot, anti-air"
  ]);
  expect(makeAbilityText(tg.state.entities[bb])).toEqual([
    "Resist 2, overpower"
  ]);
});
