import { TestGame, testp1Id } from "../testutil";
import { makeAbilityText } from "./render-entity";

test("Describing keyword abilities", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, [
    "timely_messenger",
    "fruit_ninja",
    "helpful_turtle",
    "huntress",
    "barkcoat_bear"
  ]);
  const [tm, fn, ht, hu, bb] = tg.insertedEntityIds;
  expect(makeAbilityText(tg.state.entities[tm])).toEqual(["Haste"]);
  expect(makeAbilityText(tg.state.entities[fn])).toEqual(["Frenzy 1"]);
  expect(makeAbilityText(tg.state.entities[ht])).toEqual(["Healing 1"]);
  expect(makeAbilityText(tg.state.entities[hu])).toEqual([
    "Sparkshot, anti-air"
  ]);
  expect(makeAbilityText(tg.state.entities[bb])).toEqual([
    "Resist 2, overpower"
  ]);
});

test("Describing combinations of keyword and non-keyword", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, ["brick_thief", "river_montoya", "harmony"]);
  const [bt, river, hm] = tg.insertedEntityIds;
  expect(makeAbilityText(tg.state.entities[bt])).toEqual([
    "Resist 1",
    "Arrives or attacks: Deal 1 damage to a building and repair 1 damage from another building."
  ]);
  expect(makeAbilityText(tg.state.entities[hm])).toEqual([
    "Channeling",
    "Whenever you play a spell, summon a 0/1 neutral Dancer token (limit: 3).",
    'Sacrifice Harmony → "Stop the music."'
  ]);
});

test("Describing conferred abilities", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, [
    "tenderfoot",
    "starcrossed_starlet",
    "nimble_fencer",
    "maestro",
    "blademaster"
  ]);
  const [tf, ss, nf, ma, bm] = tg.insertedEntityIds;
  expect(makeAbilityText(tg.state.entities[tf])).toEqual([
    "Haste, swift strike",
    "⤵ → Deal 2 damage to a building. ◎"
  ]);
  expect(makeAbilityText(tg.state.entities[ss])).toEqual([
    "Haste, swift strike",
    "Upkeep: This takes 1 damage.",
    "This gets +1 ATK for each damage on her.",
    "⤵ → Deal 2 damage to a building. ◎"
  ]);
});

test("Describing abilities that are keyworded internally but don't render as such", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, ["granfalloon_flagbearer", "dancer_token"]);
  const [gf, d] = tg.insertedEntityIds;
  expect(makeAbilityText(tg.state.entities[gf])).toEqual([
    "Whenever an opponent plays a spell or ability that can ◎ a flagbearer, it must ◎ a flagbearer at least once."
  ]);
  expect(makeAbilityText(tg.state.entities[d])).toEqual([
    'When you "stop the music", flip this.'
  ]);
  tg.insertEntity(testp1Id, "blademaster");
  expect(makeAbilityText(tg.state.entities[d])).toEqual([
    "Swift strike",
    'When you "stop the music", flip this.'
  ]);
});
