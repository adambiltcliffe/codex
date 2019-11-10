import {
  getCurrentPrompt,
  getCurrentPromptMode,
  getCurrentPromptModalOptions,
  getCurrentPromptCountAndTargets,
  getCurrentPromptCodexCards
} from "./prompt";

import { TestGame, testp1Id, testp2Id } from "../testutil";

import { targetMode, specs } from "../cardinfo";

test("Getting the prompt for a single-target trigger", () => {
  const tg = new TestGame();
  tg.putCardsInHand(testp1Id, ["brick_thief"]).playAction({
    type: "play",
    card: "brick_thief"
  });
  const p1base = tg.findBaseId(testp1Id);
  const p2base = tg.findBaseId(testp2Id);
  expect(getCurrentPrompt(tg.state)).toEqual("Choose a building to damage");
  expect(getCurrentPromptMode(tg.state)).toEqual(targetMode.single);
  expect(getCurrentPromptCountAndTargets(tg.state)).toEqual({
    count: 1,
    targets: [p1base, p2base]
  });
});

test("Getting the prompt for a multi-target trigger", () => {
  const tg = new TestGame();
  tg.insertEntities(testp1Id, [
    "river_montoya",
    "tenderfoot",
    "older_brother",
    "fruit_ninja"
  ])
    .insertEntity(testp2Id, "iron_man")
    .putCardsInHand(testp1Id, ["two_step"]);
  const [river, tf, ob, fn] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "two_step" });
  expect(getCurrentPrompt(tg.state)).toEqual("Choose two dance partners");
  expect(getCurrentPromptMode(tg.state)).toEqual(targetMode.multiple);
  expect(getCurrentPromptCountAndTargets(tg.state)).toEqual({
    count: 2,
    targets: [tf, ob, fn]
  });
});

test("Getting the prompt for a modal trigger", () => {
  const tg = new TestGame();
  tg.insertEntity(testp1Id, "river_montoya").putCardsInHand(testp1Id, [
    "appel_stomp"
  ]);
  const [river] = tg.insertedEntityIds;
  tg.modifyEntity(river, { level: 5, controlledSince: -1, maxedSince: -1 });
  tg.playAction({ type: "play", card: "appel_stomp" });
  expect(tg.state.log).toContain(
    "Choose a patroller to sideline: No legal choices."
  );
  expect(getCurrentPrompt(tg.state)).toEqual("Choose where to put Appel Stomp");
  expect(getCurrentPromptMode(tg.state)).toEqual(targetMode.modal);
  expect(getCurrentPromptModalOptions(tg.state)).toEqual([
    "On top of your draw pile",
    "In your discard pile"
  ]);
});

test("Getting the prompt for an obliterate trigger, no forced targets", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "pirate_gunship")
    .insertEntities(testp2Id, [
      "tenderfoot",
      "older_brother",
      "brick_thief",
      "eggship"
    ]);
  const p2base = tg.findBaseId(testp2Id);
  const [pg, tf, ob, bt, es] = tg.insertedEntityIds;
  tg.playAction({ type: "attack", attacker: pg, target: p2base });
  expect(getCurrentPrompt(tg.state)).toEqual("Choose units to obliterate");
  expect(getCurrentPromptMode(tg.state)).toEqual(targetMode.obliterate);
  expect(getCurrentPromptCountAndTargets(tg.state)).toEqual({
    count: 2,
    targets: [tf, ob, bt],
    fixed: []
  });
});

test("Getting the prompt for an obliterate trigger with a forced target", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "pirate_gunship")
    .insertEntities(testp2Id, [
      "iron_man",
      "tenderfoot",
      "sneaky_pig",
      "revolver_ocelot"
    ]);
  const p2base = tg.findBaseId(testp2Id);
  const [pg, im, tf, sp, ro] = tg.insertedEntityIds;
  tg.playAction({ type: "attack", attacker: pg, target: p2base });
  expect(getCurrentPrompt(tg.state)).toEqual("Choose units to obliterate");
  expect(getCurrentPromptMode(tg.state)).toEqual(targetMode.obliterate);
  expect(getCurrentPromptCountAndTargets(tg.state)).toEqual({
    count: 1,
    targets: [im, ro],
    fixed: [tf]
  });
});

test("Getting the active player's codex", () => {
  const tg = new TestGame()
    .setCodexBySpec(testp1Id, specs.bashing)
    .playActions([{ type: "endTurn" }, { type: "endTurn" }]);
  expect(getCurrentPrompt(tg.state)).toEqual("Choose cards to tech");
  expect(getCurrentPromptMode(tg.state)).toEqual(targetMode.codex);
  const cc = getCurrentPromptCodexCards(tg.state);
  expect(cc).toHaveLength(12);
  expect(cc[0]).toEqual({ card: "wrecking_ball", n: 2 });
});
