import {
  getNewGame,
  playActions,
  putCardInHand,
  testp1Id,
  findEntityIds,
  testp2Id,
  getGameWithUnits,
  withInsertedEntity,
  getTestGame,
  withInsertedEntities,
  withGoldSetTo,
  withCardsInHand,
  TestGame
} from "../testutil";
import { getCurrentValues } from "../entities";
import { fixtureNames } from "../fixtures";
import CodexGame from "../game";
import {
  hasKeyword,
  haste,
  unstoppable,
  swiftStrike
} from "./abilities/keywords";
import { types } from "./constants";

test("Nimble Fencer gives herself and other Virtuosos haste", () => {
  const s0 = new TestGame()
    .putCardsInHand(testp1Id, ["tenderfoot", "nimble_fencer"])
    .insertFixture(testp1Id, fixtureNames.tech1).state;
  const s1 = playActions(s0, [{ type: "play", card: "tenderfoot" }]);
  const tf = findEntityIds(s1, e => e.card == "tenderfoot")[0];
  const p2base = findEntityIds(
    s1,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  expect(hasKeyword(getCurrentValues(s1, tf), haste)).toBeFalsy();
  expect(() =>
    CodexGame.checkAction(s1, { type: "attack", attacker: tf, target: p2base })
  ).toThrow();
  const s2 = playActions(s1, [{ type: "play", card: "nimble_fencer" }]);
  expect(hasKeyword(getCurrentValues(s2, tf), haste)).toBeTruthy();
  expect(() =>
    CodexGame.checkAction(s2, { type: "attack", attacker: tf, target: p2base })
  ).not.toThrow();
  const nf = findEntityIds(s2, e => e.card == "nimble_fencer")[0];
  expect(hasKeyword(getCurrentValues(s2, nf), haste)).toBeTruthy();
  expect(() =>
    CodexGame.checkAction(s2, { type: "attack", attacker: nf, target: p2base })
  ).not.toThrow();
});

test("Star-Crossed Starlet buffs her attack with damage and kills herself after 2 turns", () => {
  const s0 = getNewGame();
  const [s1, scs] = withInsertedEntity(s0, testp1Id, "starcrossed_starlet");
  expect(s1.entities[scs].damage).toEqual(0);
  expect(getCurrentValues(s1, scs).attack).toEqual(3);
  const s2 = playActions(s1, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(s2.entities[scs].damage).toEqual(1);
  expect(getCurrentValues(s2, scs).attack).toEqual(4);
  expect(s2.log).toContain("Star-Crossed Starlet deals 1 damage to itself.");
  const s3 = playActions(s2, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(s3.entities[scs]).toBeUndefined();
  expect(s3.log).toContain("Star-Crossed Starlet dies.");
});

test("Grounded Guide buffs Virtuosos and non-Virtuosos by appropriate amounts", () => {
  const s0 = new TestGame()
    .setGold(testp1Id, 20)
    .insertFixture(testp1Id, fixtureNames.tech2)
    .putCardsInHand(testp1Id, [
      "tenderfoot",
      "older_brother",
      "grounded_guide",
      "grounded_guide"
    ]).state;
  const s1 = playActions(s0, [
    { type: "play", card: "tenderfoot" },
    { type: "play", card: "older_brother" }
  ]);
  const tf = findEntityIds(s1, u => u.card == "tenderfoot")[0];
  const ob = findEntityIds(s1, u => u.card == "older_brother")[0];
  expect(getCurrentValues(s1, tf).attack).toEqual(1);
  expect(getCurrentValues(s1, ob).attack).toEqual(2);
  expect(getCurrentValues(s1, tf).hp).toEqual(2);
  expect(getCurrentValues(s1, ob).hp).toEqual(2);
  const s2 = playActions(s1, [{ type: "play", card: "grounded_guide" }]);
  expect(getCurrentValues(s2, tf).attack).toEqual(3);
  expect(getCurrentValues(s2, ob).attack).toEqual(3);
  expect(getCurrentValues(s2, tf).hp).toEqual(3);
  expect(getCurrentValues(s2, ob).hp).toEqual(2);
  const gg1 = findEntityIds(s2, u => u.card == "grounded_guide")[0];
  expect(getCurrentValues(s2, gg1).attack).toEqual(4);
  expect(getCurrentValues(s2, gg1).hp).toEqual(4);
  const s3 = playActions(s2, [{ type: "play", card: "grounded_guide" }]);
  expect(getCurrentValues(s3, tf).attack).toEqual(5);
  expect(getCurrentValues(s3, ob).attack).toEqual(4);
  expect(getCurrentValues(s3, tf).hp).toEqual(4);
  expect(getCurrentValues(s3, ob).hp).toEqual(2);
  expect(getCurrentValues(s3, gg1).attack).toEqual(5);
  expect(getCurrentValues(s3, gg1).hp).toEqual(4);
});

test("Nimble Fencer and Grounded Guide don't buff opposing units", () => {
  const s0 = getGameWithUnits(
    ["nimble_fencer", "grounded_guide"],
    ["tenderfoot"]
  );
  const tf = findEntityIds(s0, e => e.card == "tenderfoot")[0];
  const tfv = getCurrentValues(s0, tf);
  expect(tfv.attack).toEqual(1);
  expect(tfv.hp).toEqual(2);
  expect(hasKeyword(tfv, haste)).toBeFalsy();
});

test("Maestro confers its activated ability on Virtuosos", () => {
  const [s0, [ma, tf, ob]] = withInsertedEntities(getTestGame(), testp1Id, [
    "maestro",
    "tenderfoot",
    "older_brother"
  ]);
  const p2base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  expect(getCurrentValues(s0, ma).abilities.length).toEqual(1);
  expect(getCurrentValues(s0, tf).abilities.length).toEqual(1);
  expect(getCurrentValues(s0, ob).abilities.length).toEqual(0);
  expect(() =>
    CodexGame.checkAction(s0, { type: "activate", source: tf, index: 0 })
  ).toThrow();
  const s1 = playActions(s0, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(() =>
    CodexGame.checkAction(s1, { type: "activate", source: tf, index: 0 })
  ).not.toThrow();
  const s2 = playActions(s1, [
    { type: "activate", source: tf, index: 0 },
    { type: "choice", target: p2base }
  ]);
  expect(s2.entities[p2base].damage).toEqual(2);
  expect(s2.log).toContain("Tenderfoot deals 2 damage to base.");
});

test("Maestro's conferred ability disappears if it dies", () => {
  const [s0, [im1, im2]] = withInsertedEntities(getTestGame(), testp2Id, [
    "iron_man",
    "iron_man"
  ]);
  const [s1, [ma, tf]] = withInsertedEntities(s0, testp1Id, [
    "maestro",
    "tenderfoot"
  ]);
  const s2 = playActions(s1, [{ type: "endTurn" }, { type: "endTurn" }]);
  expect(getCurrentValues(s2, tf).abilities.length).toEqual(1);
  expect(() =>
    CodexGame.checkAction(s2, { type: "activate", source: tf, index: 0 })
  ).not.toThrow();
  const s3 = playActions(s2, [
    { type: "endTurn" },
    { type: "attack", attacker: im1, target: ma },
    { type: "attack", attacker: im2, target: ma },
    { type: "endTurn" }
  ]);
  expect(s3.entities[ma]).toBeUndefined();
  expect(getCurrentValues(s3, tf).abilities.length).toEqual(0);
  expect(() =>
    CodexGame.checkAction(s3, { type: "activate", source: tf, index: 0 })
  ).toThrow();
});

test("Maestro reduces cost to cast Virtuosos to 0", () => {
  const s0 = withGoldSetTo(
    withCardsInHand(getTestGame(), ["tenderfoot"], []),
    testp1Id,
    0
  );
  expect(() =>
    CodexGame.checkAction(s0, { type: "play", card: "tenderfoot" })
  ).toThrow();
  const [s1, ma] = withInsertedEntity(s0, testp1Id, "maestro");
  expect(() =>
    CodexGame.checkAction(s1, { type: "play", card: "tenderfoot" })
  ).not.toThrow();
  const s2 = playActions(s1, [{ type: "play", card: "tenderfoot" }]);
  expect(s2.players[testp1Id].gold).toEqual(0);
  const s1a = withGoldSetTo(s1, testp1Id, 10);
  const s2a = playActions(s1a, [{ type: "play", card: "tenderfoot" }]);
  expect(s2a.players[testp1Id].gold).toEqual(10);
});

test("Discord gives tech 0 and 1 units a debuff but not 2 or 3", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["discord"])
    .insertEntity(testp1Id, "river_montoya")
    .insertEntities(testp2Id, [
      "older_brother",
      "iron_man",
      "eggship",
      "trojan_duck"
    ]);
  const [river, ob, im, es, td] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "discord" });
  expect(tg.state.log).toContain(`\${${testp1Id}} plays Discord.`);
  expect(tg.state.log).toContain(
    `Older Brother and Iron Man get -2/-1 this turn.`
  );
  expect(tg.state.entities[ob].current).toMatchObject({ attack: 0, hp: 1 });
  expect(tg.state.entities[im].current).toMatchObject({ attack: 1, hp: 3 });
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[ob].current).toMatchObject({ attack: 2, hp: 2 });
  expect(tg.state.entities[im].current).toMatchObject({ attack: 3, hp: 4 });
});

test("Discord doesn't affect your own units", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["discord"])
    .insertEntities(testp1Id, [
      "river_montoya",
      "older_brother",
      "iron_man",
      "eggship"
    ]);
  const [river, ob, im, es] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "discord" });
  expect(tg.state.log).toContain(`\${${testp1Id}} plays Discord.`);
  expect(tg.state.log).toContain("No units were affected.");
  expect(tg.state.entities[ob].current).toMatchObject({ attack: 2, hp: 2 });
  expect(tg.state.entities[im].current).toMatchObject({ attack: 3, hp: 4 });
});

test("Discord kills small units", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["discord"])
    .insertEntity(testp1Id, "river_montoya")
    .insertEntities(testp2Id, ["brick_thief", "timely_messenger"]);
  const [river, bt, tm] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "discord" });
  expect(tg.state.log).toContain(`\${${testp1Id}} plays Discord.`);
  expect(tg.state.log).toContain(
    "Brick Thief and Timely Messenger get -2/-1 this turn."
  );
  expect(tg.state.log).toContain("Brick Thief dies.");
  expect(tg.state.log).toContain("Timely Messenger dies.");
  expect(tg.state.entities[bt]).toBeUndefined();
  expect(tg.state.entities[tm]).toBeUndefined();
});

test("Sidelining a patroller with Appel Stomp and putting it back", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["older_brother", "tenderfoot", "fruit_ninja"])
    .insertEntity(testp2Id, "river_montoya");
  const [ob, tf, fn, river] = tg.insertedEntityIds;
  tg.modifyEntity(river, { level: 5, controlledSince: -1, maxedSince: -1 })
    .playAction({ type: "endTurn", patrollers: [ob, tf, null, null, null] })
    .putCardsInHand(testp2Id, ["appel_stomp"]);
  expect(tg.state.players[testp2Id].hand.length).toEqual(6);
  expect(tg.state.players[testp2Id].deck.length).toEqual(5);
  expect(tg.state.players[testp2Id].discard.length).toEqual(0);
  const topCard = tg.state.players[testp2Id].deck[0];
  tg.playAction({ type: "play", card: "appel_stomp" });
  expect(tg.getLegalChoices().sort()).toEqual([ob, tf].sort());
  tg.playAction({ type: "choice", target: ob });
  expect(tg.state.players[testp2Id].hand.length).toEqual(6);
  expect(tg.state.players[testp2Id].deck.length).toEqual(4);
  expect(tg.state.players[testp2Id].hand).toContain(topCard);
  tg.playAction({ type: "choice", index: 0 });
  expect(tg.state.players[testp1Id].patrollerIds[0]).toBeNull();
  expect(tg.state.players[testp2Id].hand.length).toEqual(6);
  expect(tg.state.players[testp2Id].deck.length).toEqual(5);
  expect(tg.state.players[testp2Id].deck[0]).toEqual("appel_stomp");
  expect(tg.state.players[testp2Id].discard.length).toEqual(0);
});

test("Sidelining a patroller with Appel Stomp and discarding it", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "older_brother")
    .insertEntity(testp2Id, "river_montoya");
  const [ob, river] = tg.insertedEntityIds;
  tg.modifyEntity(river, { level: 5, controlledSince: -1, maxedSince: -1 })
    .playAction({ type: "endTurn", patrollers: [ob, null, null, null, null] })
    .putCardsInHand(testp2Id, ["appel_stomp"]);
  tg.playAction({ type: "play", card: "appel_stomp" });
  tg.playAction({ type: "choice", index: 1 });
  expect(tg.state.players[testp2Id].hand.length).toEqual(6);
  expect(tg.state.players[testp2Id].deck.length).toEqual(4);
  expect(tg.state.players[testp2Id].discard).toEqual(["appel_stomp"]);
});

test("Harmony can enter play and is sacrificed when Finesse hero dies", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "river_montoya")
    .insertEntity(testp2Id, "iron_man")
    .putCardsInHand(testp1Id, ["harmony"]);
  const [river, im] = tg.insertedEntityIds;
  tg.modifyEntity(river, { controlledSince: -1 }).playAction({
    type: "play",
    card: "harmony"
  });
  const h = findEntityIds(tg.state, e => e.card == "harmony");
  expect(h).toHaveLength(1);
  expect(tg.state.entities[h[0]].current.type).toEqual(types.spell);
  tg.playAction({ type: "attack", attacker: river, target: im });
  expect(tg.state.log).toContain("River Montoya dies.");
  expect(tg.state.log).toContain("Harmony is sacrificed.");
  expect(tg.state.entities[h[0]]).toBeUndefined();
  expect(tg.state.players[testp1Id].discard).toContain("harmony");
});

test("Harmony creates a token when you cast a spell, but only after resolving it", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "river_montoya")
    .putCardsInHand(testp1Id, ["harmony", "bloom"])
    .insertEntity(testp2Id, "iron_man");
  const [river, im] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "harmony" });
  expect(tg.state.log).not.toContain("Harmony creates a Dancer token.");
  expect(tg.state.currentTrigger).toBeNull();
  tg.playAction({ type: "play", card: "bloom" });
  expect(tg.state.log).not.toContain("Harmony creates a Dancer token.");
  expect(tg.state.currentTrigger).not.toBeNull();
  expect(tg.state.queue).toHaveLength(1);
  expect(findEntityIds(tg.state, e => e.card == "dancer_token")).toHaveLength(
    0
  );
  tg.playAction({ type: "choice", target: river });
  expect(tg.state.log).toContain("Harmony creates a Dancer token.");
  expect(findEntityIds(tg.state, e => e.card == "dancer_token")).toHaveLength(
    1
  );
});

test("Harmony creates no token when you play a unit", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "river_montoya")
    .putCardsInHand(testp1Id, ["harmony", "older_brother"])
    .insertEntity(testp2Id, "iron_man");
  tg.playAction({ type: "play", card: "harmony" });
  tg.playAction({ type: "play", card: "older_brother" });
  expect(tg.state.queue).toHaveLength(0);
  expect(tg.state.log).not.toContain("Harmony creates a Dancer token.");
  expect(findEntityIds(tg.state, e => e.card == "dancer_token")).toHaveLength(
    0
  );
});

test("Harmony doesn't create a token if you already have 3 dancers", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "river_montoya")
    .putCardsInHand(testp1Id, ["harmony", "discord"])
    .insertEntities(testp1Id, ["dancer_token", "dancer_token", "dancer_token"])
    .playActions([
      { type: "play", card: "harmony" },
      { type: "play", card: "discord" }
    ]);
  expect(tg.state.log).toContain(
    "Harmony cannot create any more Dancer tokens."
  );
  expect(findEntityIds(tg.state, e => e.card == "dancer_token")).toHaveLength(
    3
  );
});

test("Harmony doesn't create a token if you have a mix of 3 dancers", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "river_montoya")
    .putCardsInHand(testp1Id, ["harmony", "discord"])
    .insertEntities(testp1Id, [
      "dancer_token",
      "dancer_token",
      "angry_dancer_token"
    ])
    .playActions([
      { type: "play", card: "harmony" },
      { type: "play", card: "discord" }
    ]);
  expect(tg.state.log).toContain(
    "Harmony cannot create any more Dancer tokens."
  );
  expect(findEntityIds(tg.state, e => e.card == "dancer_token")).toHaveLength(
    2
  );
});

test("Harmony doesn't create tokens for your opponent", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .putCardsInHand(testp1Id, ["the_boot"])
    .putCardsInHand(testp2Id, ["discord"])
    .insertEntities(testp2Id, ["river_montoya", "harmony"]);
  const [troq, river, harmony] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "the_boot" });
  expect(tg.state.log).not.toContain("Harmony creates a Dancer token.");
  expect(findEntityIds(tg.state, e => e.card == "dancer_token")).toHaveLength(
    0
  );
  tg.playActions([{ type: "endTurn" }, { type: "play", card: "discord" }]);
  expect(tg.state.log).toContain("Harmony creates a Dancer token.");
  expect(findEntityIds(tg.state, e => e.card == "dancer_token")).toHaveLength(
    1
  );
});

test("Killed Dancer tokens don't go to discard", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "timely_messenger")
    .insertEntity(testp2Id, "dancer_token");
  const [tm, token] = tg.insertedEntityIds;
  tg.playAction({ type: "attack", attacker: tm, target: token });
  expect(tg.state.log).toContain("Dancer dies.");
  expect(tg.state.players[testp2Id].discard).toEqual([]);
});

test("Can activate Harmony to flip dancers", () => {
  const tg = new TestGame().insertEntities(testp1Id, [
    "river_montoya",
    "harmony",
    "dancer_token",
    "dancer_token"
  ]);
  const [river, harmony, token1, token2] = tg.insertedEntityIds;
  tg.playAction({ type: "activate", source: harmony, index: 2 });
  expect(tg.state.entities[token1].card).toEqual("angry_dancer_token");
  expect(tg.state.entities[token2].card).toEqual("angry_dancer_token");
  expect(tg.state.entities[token1].current).toMatchObject({
    attack: 2,
    hp: 1,
    name: "Angry Dancer"
  });
  expect(
    hasKeyword(tg.state.entities[token1].current, unstoppable)
  ).toBeTruthy();
});

test("Blademaster gives other units swift strike", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["blademaster"])
    .setGold(testp1Id, 6)
    .insertFixture(testp1Id, fixtureNames.tech3)
    .insertEntity(testp1Id, "iron_man")
    .insertEntity(testp2Id, "regularsized_rhinoceros");
  const [t3, im, rr] = tg.insertedEntityIds;
  expect(hasKeyword(tg.state.entities[im].current, swiftStrike)).toBeFalsy();
  tg.playAction({ type: "play", card: "blademaster" });
  const bm = findEntityIds(tg.state, e => e.card == "blademaster")[0];
  expect(hasKeyword(tg.state.entities[im].current, swiftStrike)).toBeTruthy();
  tg.modifyEntity(rr, { armor: 5 }).playActions([
    { type: "endTurn" },
    { type: "attack", attacker: rr, target: bm }
  ]);
  expect(tg.state.log).toContain("Blademaster dies.");
  expect(hasKeyword(tg.state.entities[im].current, swiftStrike)).toBeFalsy();
});

test("If Blademaster dies on defense, others don't deal damage twice", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["blademaster", "fox_primus"])
    .insertEntities(testp2Id, ["blademaster", "spectral_roc"]);
  const [bm1, fp, bm2, sr] = tg.insertedEntityIds;
  tg.modifyEntity(bm1, { damage: 3 }).playActions([
    { type: "endTurn", patrollers: [fp, null, null, null, null] },
    { type: "attack", attacker: sr, target: bm1 }
  ]);
  expect(tg.state.log).toContain(
    "Spectral Roc attacks Blademaster, flying over Fox Primus."
  );
  expect(tg.state.entities[sr].damage).toEqual(2);
  expect(tg.state.log).toContain("Fox Primus deals 2 damage to Spectral Roc.");
  expect(tg.state.log).toContain("Spectral Roc deals 4 damage to Blademaster.");
  expect(tg.state.log).toContain("Blademaster dies.");
  expect(tg.state.log).not.toContain("Spectral Roc dies.");
});

test("Can buff two of your units with Two Step, goes away when River dies", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "river_montoya",
      "tenderfoot",
      "older_brother",
      "fruit_ninja"
    ])
    .putCardsInHand(testp1Id, ["two_step"])
    .insertEntity(testp2Id, "iron_man");
  const [river, tf, ob, fn, im] = tg.insertedEntityIds;
  tg.modifyEntity(river, { controlledSince: -1 });
  expect(tg.state.entities[tf].current).toMatchObject({ attack: 1, hp: 2 });
  expect(tg.state.entities[ob].current).toMatchObject({ attack: 2, hp: 2 });
  tg.playAction({ type: "play", card: "two_step" });
  tg.playAction({ type: "choice", targets: [tf, ob] });
  expect(tg.state.entities[tf].current).toMatchObject({ attack: 3, hp: 4 });
  expect(tg.state.entities[ob].current).toMatchObject({ attack: 4, hp: 4 });
  tg.playAction({ type: "attack", attacker: river, target: im });
  expect(tg.state.entities[tf].current).toMatchObject({ attack: 1, hp: 2 });
  expect(tg.state.entities[ob].current).toMatchObject({ attack: 2, hp: 2 });
  expect(tg.state.log).toContain("River Montoya dies.");
  expect(tg.state.log).toContain("Two Step is sacrificed.");
});

test("Can buff two of your units with Two Step, goes away when one dies", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "river_montoya",
      "timely_messenger",
      "older_brother",
      "fruit_ninja"
    ])
    .putCardsInHand(testp1Id, ["two_step"])
    .insertEntity(testp2Id, "iron_man");
  const [river, tm, ob, fn, im] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "two_step" });
  tg.playAction({ type: "choice", targets: [tm, ob] });
  expect(tg.state.entities[tm].current).toMatchObject({ attack: 3, hp: 3 });
  expect(tg.state.entities[ob].current).toMatchObject({ attack: 4, hp: 4 });
  tg.playAction({ type: "attack", attacker: tm, target: im });
  expect(tg.state.entities[ob].current).toMatchObject({ attack: 2, hp: 2 });
  expect(tg.state.entities[im].damage).toEqual(3);
  expect(tg.state.log).toContain("Timely Messenger dies.");
  expect(tg.state.log).toContain("Two Step is sacrificed.");
});

test("Two Step requires exactly two targets and you must control them", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "river_montoya",
      "tenderfoot",
      "older_brother",
      "fruit_ninja"
    ])
    .insertEntity(testp2Id, "brick_thief")
    .putCardsInHand(testp1Id, ["two_step"]);
  const [river, tf, ob, fn, bt] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "two_step" });
  expect(tg.getLegalChoices().sort()).toEqual([tf, ob, fn].sort());
  expect(() => tg.checkAction({ type: "choice", targets: [tf] })).toThrow(
    "Too few"
  );
  expect(() =>
    tg.checkAction({ type: "choice", targets: [tf, ob, fn] })
  ).toThrow("Too many");
  expect(() => tg.checkAction({ type: "choice", targets: [tf, bt] })).toThrow(
    "legal choice"
  );
  expect(() =>
    tg.checkAction({ type: "choice", targets: [tf, river] })
  ).toThrow("legal choice");
});

test("Can't re-partner something already partnered with Two Step", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "river_montoya",
      "timely_messenger",
      "older_brother",
      "fruit_ninja",
      "brick_thief",
      "helpful_turtle"
    ])
    .putCardsInHand(testp1Id, ["two_step", "two_step", "two_step"])
    .setGold(testp1Id, 6)
    .insertEntity(testp2Id, "iron_man");
  const [river, tm, ob, fn, bt, ht, im] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "two_step" });
  tg.playAction({ type: "choice", targets: [tm, ob] });
  tg.playAction({ type: "play", card: "two_step" });
  expect(tg.getLegalChoices().sort()).toEqual([bt, fn, ht].sort());
  expect(() => tg.checkAction({ type: "choice", targets: [ob, fn] })).toThrow(
    "legal choice"
  );
  tg.playAction({ type: "choice", targets: [bt, ht] });
  tg.playAction({ type: "attack", attacker: tm, target: im });
  expect(tg.state.log).toContain("Two Step is sacrificed.");
  tg.playAction({ type: "play", card: "two_step" });
  expect(tg.getLegalChoices()).toEqual([ob, fn].sort());
  expect(() =>
    tg.checkAction({ type: "choice", targets: [ob, fn] })
  ).not.toThrow();
});

test("Skip resolving Two Step if you only control one unit", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["river_montoya", "older_brother"])
    .putCardsInHand(testp1Id, ["two_step"])
    .playAction({ type: "play", card: "two_step" });
  expect(tg.state.log).toContain(
    "Choose two dance partners: Not enough legal choices."
  );
  expect(tg.state.currentTrigger).toBeNull();
  expect(tg.state.playedCard).toBeUndefined();
  expect(tg.state.players[testp1Id].discard).toContain("two_step");
});

test("If you control a flagbearer, you have to partner it", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "river_montoya",
      "tenderfoot",
      "older_brother",
      "granfalloon_flagbearer"
    ])
    .putCardsInHand(testp1Id, ["two_step"]);
  const [river, tf, ob, gf] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "two_step" });
  expect(() => tg.checkAction({ type: "choice", targets: [tf, ob] })).toThrow(
    "flagbearer"
  );
  expect(() =>
    tg.checkAction({ type: "choice", targets: [tf, gf] })
  ).not.toThrow();
});

test("If you control two flagbearers, you only have to partner one", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "river_montoya",
      "tenderfoot",
      "older_brother",
      "granfalloon_flagbearer",
      "granfalloon_flagbearer"
    ])
    .putCardsInHand(testp1Id, ["two_step"]);
  const [river, tf, ob, gf1, gf2] = tg.insertedEntityIds;
  tg.playAction({ type: "play", card: "two_step" });
  expect(() => tg.checkAction({ type: "choice", targets: [tf, ob] })).toThrow(
    "flagbearer"
  );
  expect(() =>
    tg.checkAction({ type: "choice", targets: [tf, gf1] })
  ).not.toThrow();
  expect(() =>
    tg.checkAction({ type: "choice", targets: [gf1, gf2] })
  ).not.toThrow();
});

test("If your flagbearer is already partnered, you can partner two other units", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, [
      "river_montoya",
      "tenderfoot",
      "older_brother",
      "fruit_ninja",
      "granfalloon_flagbearer"
    ])
    .putCardsInHand(testp1Id, ["two_step", "two_step"]);
  const [river, tf, ob, fn, gf] = tg.insertedEntityIds;
  tg.playActions([
    { type: "play", card: "two_step" },
    { type: "choice", targets: [tf, gf] },
    { type: "play", card: "two_step" }
  ]);
  expect(() =>
    tg.checkAction({ type: "choice", targets: [ob, fn] })
  ).not.toThrow();
});
