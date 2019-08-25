import { buildSingleCodex, buildStarterDeck, playableSpecs } from "./codex";
import { specs, specColors, colors } from "./cardinfo";

import uniq from "lodash/uniq";

test("Building neutral starter deck", () => {
  expect(buildStarterDeck(colors.neutral)).toEqual([
    "timely_messenger",
    "tenderfoot",
    "older_brother",
    "brick_thief",
    "helpful_turtle",
    "granfalloon_flagbearer",
    "fruit_ninja",
    "spark",
    "bloom",
    "wither"
  ]);
});

test("Building a single-spec codex for Bashing", () => {
  expect(buildSingleCodex(specs.bashing)).toEqual([
    { card: "wrecking_ball", n: 2 },
    { card: "the_boot", n: 2 },
    { card: "intimidate", n: 2 },
    { card: "final_smash", n: 2 },
    { card: "iron_man", n: 2 },
    { card: "revolver_ocelot", n: 2 },
    { card: "hired_stomper", n: 2 },
    { card: "regularsized_rhinoceros", n: 2 },
    { card: "sneaky_pig", n: 2 },
    { card: "eggship", n: 2 },
    { card: "harvest_reaper", n: 2 },
    { card: "trojan_duck", n: 2 }
  ]);
});

test("Each playable spec has a starter deck of 10 cards", () => {
  const playableColors = uniq(playableSpecs.map(s => specColors[s]));
  playableColors.forEach(c => {
    expect(buildStarterDeck(c)).toHaveLength(10);
  });
});

test("Each playable spec has 12 codex cards", () => {
  playableSpecs.forEach(s => {
    expect(buildSingleCodex(s)).toHaveLength(12);
  });
});
