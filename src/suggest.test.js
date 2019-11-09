import { TestGame, testp1Id, testp2Id } from "./testutil";
import suggestActions from "./suggest";

test("suggestActions for targetMode.multiple", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "river_montoya",
      "tenderfoot",
      "older_brother",
      "fruit_ninja"
    ])
    .putCardsInHand(testp1Id, ["two_step"])
    .playAction({ type: "play", card: "two_step" });
  const [river, tf, ob, fn] = tg.insertedEntityIds;
  expect(suggestActions(tg.state)).toEqual([
    { type: "choice", targets: [tf, ob] }
  ]);
});

test("suggestActions for targetMode.multiple with flagbearer", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "river_montoya",
      "tenderfoot",
      "older_brother",
      "granfalloon_flagbearer"
    ])
    .putCardsInHand(testp1Id, ["two_step"])
    .playAction({ type: "play", card: "two_step" });
  const [river, tf, ob, gf] = tg.insertedEntityIds;
  expect(suggestActions(tg.state)).toEqual([
    { type: "choice", targets: [gf, tf] }
  ]);
});

test("suggestActions for targetMode.obliterate (free choice)", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "pirate_gunship")
    .insertEntities(testp2Id, ["tenderfoot", "older_brother", "brick_thief"]);
  const [pg, tf, ob, bt] = tg.insertedEntityIds;
  tg.playAction({
    type: "attack",
    attacker: pg,
    target: tg.findBaseId(testp2Id)
  });
  expect(suggestActions(tg.state)).toEqual([
    { type: "choice", targets: [tf, ob] }
  ]);
});

test("suggestActions for targetMode.obliterate (forced choice)", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "pirate_gunship")
    .insertEntities(testp2Id, [
      "iron_man",
      "tenderfoot",
      "sneaky_pig",
      "revolver_ocelot"
    ]);
  const [pg, im, tf, sp, ro] = tg.insertedEntityIds;
  tg.playAction({
    type: "attack",
    attacker: pg,
    target: tg.findBaseId(testp2Id)
  });
  expect(suggestActions(tg.state)).toEqual([{ type: "choice", targets: [im] }]);
});
