import {
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  testp2Id,
  findEntityIds,
  withInsertedEntity,
  TestGame
} from "../testutil";
import { fixtureNames } from "../fixtures";
import { hasKeyword, stealth } from "./abilities/keywords";

test("Hired Stomper must kill itself with own trigger if no other units", () => {
  const s0 = new TestGame()
    .insertFixture(testp1Id, fixtureNames.tech2)
    .putCardsInHand(testp1Id, ["hired_stomper"]).state;
  expect(s0.currentTrigger).toBeNull();
  const s1 = playActions(s0, [{ type: "play", card: "hired_stomper" }]);
  expect(s1.log).toContain("Hired Stomper deals 3 damage to itself.");
});

test("Hired Stomper can kill itself with own trigger even if other options available", () => {
  const s0 = new TestGame()
    .insertFixture(testp1Id, fixtureNames.tech2)
    .insertEntity(testp1Id, "older_brother")
    .putCardsInHand(testp1Id, ["hired_stomper"]).state;
  expect(s0.currentTrigger).toBeNull();
  const s1 = playActions(s0, [{ type: "play", card: "hired_stomper" }]);
  expect(s1.currentTrigger).not.toBeNull();
  const hs = findEntityIds(s1, e => e.card == "hired_stomper")[0];
  const s2 = playActions(s1, [{ type: "choice", target: hs }]);
  expect(s2.entities[hs]).toBeUndefined();
  expect(s2.log).toContain("Hired Stomper deals 3 damage to itself.");
});

test("Hired Stomper can target your own units or the opponent's", () => {
  const s0 = new TestGame()
    .insertFixture(testp1Id, fixtureNames.tech2)
    .insertFixture(testp2Id, fixtureNames.tech2)
    .putCardsInHand(testp1Id, ["regularsized_rhinoceros"])
    .putCardsInHand(testp2Id, [
      "regularsized_rhinoceros",
      "hired_stomper",
      "hired_stomper"
    ])
    .setGold(testp2Id, 20).state;
  const s1 = playActions(s0, [
    { type: "play", card: "regularsized_rhinoceros" },
    { type: "endTurn" },
    { type: "play", card: "regularsized_rhinoceros" }
  ]);
  const p1rhino = findEntityIds(
    s1,
    e => e.card == "regularsized_rhinoceros" && e.owner == testp1Id
  )[0];
  const p2rhino = findEntityIds(
    s1,
    e => e.card == "regularsized_rhinoceros" && e.owner == testp2Id
  )[0];
  const s2 = playActions(s1, [
    { type: "play", card: "hired_stomper" },
    { type: "choice", target: p1rhino },
    { type: "play", card: "hired_stomper" },
    { type: "choice", target: p2rhino }
  ]);
  expect(s2.entities[p1rhino].damage).toEqual(3);
  expect(s2.entities[p2rhino].damage).toEqual(3);
});

test("Wrecking Ball can deal damage to base", () => {
  const [s0, troq] = withInsertedEntity(getNewGame(), testp1Id, "troq_bashar");
  putCardInHand(s0, testp1Id, "wrecking_ball");
  const p2base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  const s1 = playActions(s0, [{ type: "play", card: "wrecking_ball" }]);
  const s2 = playActions(s1, [{ type: "choice", target: p2base }]);
  expect(s2.entities[p2base].damage).toEqual(2);
  expect(s2.log).toContain("Wrecking Ball deals 2 damage to base.");
});

test("The Boot can kill a tech 0 or 1 unit but not tech 2 or 3", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["the_boot"])
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, [
      "older_brother",
      "iron_man",
      "eggship",
      "trojan_duck"
    ]);
  const [troq, ob, im, es, td] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "the_boot" });
  expect(tg.getLegalChoices().sort()).toEqual([ob, im].sort());
  expect(() => tg.playAction({ type: "choice", target: es })).toThrow();
  expect(() => tg.playAction({ type: "choice", target: td })).toThrow();
  const tg1 = new TestGame(tg.state);
  tg1.playAction({ type: "choice", target: ob });
  expect(tg1.state.entities[ob]).toBeUndefined();
  expect(tg1.state.log).toContain("Older Brother dies.");
  const tg2 = new TestGame(tg.state);
  tg2.playAction({ type: "choice", target: im });
  expect(tg2.state.entities[im]).toBeUndefined();
  expect(tg2.state.log).toContain("Iron Man dies.");
});

test("Intimidate decreases attack by 4 for a turn", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, ["older_brother", "regularsized_rhinoceros"])
    .putCardsInHand(testp1Id, ["intimidate", "intimidate"]);
  const [troq, ob, rr] = tg.insertedEntityIds;
  tg.playActions([
    { type: "play", card: "intimidate" },
    { type: "choice", target: ob },
    { type: "play", card: "intimidate" },
    { type: "choice", target: rr }
  ]);
  expect(tg.state.entities[ob].current.attack).toEqual(0);
  expect(tg.state.entities[rr].current.attack).toEqual(1);
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[ob].current.attack).toEqual(2);
  expect(tg.state.entities[rr].current.attack).toEqual(5);
});

test("Sneaky Pig has stealth on first turn but not later", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "iron_man")
    .putCardsInHand(testp2Id, ["sneaky_pig"])
    .insertFixture(testp2Id, fixtureNames.tech2);
  const [im] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn", patrollers: [im, null, null, null, null] },
    { type: "play", card: "sneaky_pig" }
  ]);
  const sp = findEntityIds(tg.state, e => e.card == "sneaky_pig")[0];
  const p1base = tg.findBaseId(testp1Id);
  expect(tg.state.entities[sp].effects.length).toEqual(1);
  expect(hasKeyword(tg.state.entities[sp].current, stealth)).toBeTruthy();
  expect(() =>
    tg.checkAction({ type: "attack", attacker: sp, target: p1base })
  ).not.toThrow();
  tg.playActions([
    { type: "endTurn" },
    { type: "endTurn", patrollers: [im, null, null, null, null] }
  ]);
  expect(tg.state.entities[sp].effects.length).toEqual(0);
  expect(hasKeyword(tg.state.entities[sp].current, stealth)).toBeFalsy();
  expect(() =>
    tg.checkAction({ type: "attack", attacker: sp, target: p1base })
  ).toThrow();
});

test("Final Smash can do all three of its effects", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, ["tenderfoot", "nimble_fencer", "leaping_lizard"])
    .setGold(testp1Id, 6)
    .putCardsInHand(testp1Id, ["final_smash"]);
  const [troq, tf, nf, ll] = tg.insertedEntityIds;
  tg.modifyEntity(troq, { level: 8, controlledSince: -1, maxedSince: -1 });
  tg.playAction({ type: "play", card: "final_smash" });
  expect(tg.state.log).toEqual([
    `\${${testp1Id}} plays Final Smash.`,
    "Choose a tech 0 unit to destroy: Only one legal choice.",
    "Tenderfoot dies.",
    "Choose a tech 1 unit to return to its owner's hand: Only one legal choice.",
    `Nimble Fencer is returned to \${${testp2Id}}'s hand.`,
    "Choose a tech 2 unit to gain control of: Only one legal choice.",
    `\${${testp1Id}} gains control of Leaping Lizard.`
  ]);
  expect(tg.state.entities[tf]).toBeUndefined();
  expect(tg.state.entities[nf]).toBeUndefined();
  expect(tg.state.entities[ll].current.controller).toEqual(testp1Id);
  expect(tg.state.players[testp2Id].hand).toContain("nimble_fencer");
});

test("Final Smash can do the second and third steps without a target for the first", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, [
      "iron_man",
      "revolver_ocelot",
      "sneaky_pig",
      "eggship",
      "trojan_duck"
    ]);
  const [troq, im, ro, sp, es, td] = tg.insertedEntityIds;
  tg.modifyEntity(troq, { level: 8, controlledSince: -1, maxedSince: -1 })
    .putCardsInHand(testp1Id, ["final_smash"])
    .setGold(testp1Id, 6)
    .playAction({ type: "play", card: "final_smash" });
  expect(tg.state.log).toContain(
    "Choose a tech 0 unit to destroy: No legal choices."
  );
  expect(tg.getLegalChoices().sort()).toEqual([im, ro].sort());
  tg.playAction({ type: "choice", target: im });
  expect(tg.state.log).toContain(
    `Iron Man is returned to \${${testp2Id}}'s hand.`
  );
  expect(tg.getLegalChoices().sort()).toEqual([sp, es].sort());
  tg.playAction({ type: "choice", target: es });
  expect(tg.state.log).toContain(`\${${testp1Id}} gains control of Eggship.`);
  expect(tg.state.currentTrigger).toBeNull();
});

test("Final Smash requires a target for each step if needed", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, [
      "tenderfoot",
      "older_brother",
      "iron_man",
      "revolver_ocelot",
      "sneaky_pig",
      "eggship",
      "trojan_duck"
    ]);
  const [troq, tf, ob, im, ro, sp, es, td] = tg.insertedEntityIds;
  tg.modifyEntity(troq, { level: 8, controlledSince: -1, maxedSince: -1 })
    .putCardsInHand(testp1Id, ["final_smash"])
    .setGold(testp1Id, 6)
    .playAction({ type: "play", card: "final_smash" });
  expect(tg.getLegalChoices().sort()).toEqual([tf, ob].sort());
  tg.playAction({ type: "choice", target: ob });
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.getLegalChoices().sort()).toEqual([im, ro].sort());
  tg.playAction({ type: "choice", target: im });
  expect(tg.state.log).toContain(
    `Iron Man is returned to \${${testp2Id}}'s hand.`
  );
  expect(tg.getLegalChoices().sort()).toEqual([sp, es].sort());
  tg.playAction({ type: "choice", target: es });
  expect(tg.state.log).toContain(`\${${testp1Id}} gains control of Eggship.`);
  expect(tg.state.currentTrigger).toBeNull();
});

test("Final Smash can auto-target some steps and prompt for others", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, [
      "older_brother",
      "iron_man",
      "revolver_ocelot",
      "sneaky_pig"
    ]);
  const [troq, ob, im, ro, sp] = tg.insertedEntityIds;
  tg.modifyEntity(troq, { level: 8, controlledSince: -1, maxedSince: -1 })
    .putCardsInHand(testp1Id, ["final_smash"])
    .setGold(testp1Id, 6)
    .playAction({ type: "play", card: "final_smash" });
  expect(tg.state.log).toContain("Older Brother dies.");
  expect(tg.getLegalChoices().sort()).toEqual([im, ro].sort());
  tg.playAction({ type: "choice", target: im });
  expect(tg.state.log).toContain(
    `Iron Man is returned to \${${testp2Id}}'s hand.`
  );
  expect(tg.state.log).toContain(
    `\${${testp1Id}} gains control of Sneaky Pig.`
  );
  expect(tg.state.currentTrigger).toBeNull();
});
