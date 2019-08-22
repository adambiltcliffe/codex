import CodexGame from "../codex";
import {
  findEntityIds,
  getNewGame,
  putCardInHand,
  testp1Id,
  TestGame
} from "../testutil";

test("Can put units into play", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "iron_man");
  expect(
    findEntityIds(s0, u => u.owner == testp1Id && u.card == "iron_man").length
  ).toEqual(0);
  const { state: s1 } = CodexGame.playAction(s0, {
    type: "play",
    card: "iron_man"
  });
  expect(
    findEntityIds(s1, u => u.owner == testp1Id && u.card == "iron_man").length
  ).toEqual(1);
});

test("Can't cast spells without a hero", () => {
  const tg = new TestGame().putCardsInHand(testp1Id, [
    "wither",
    "wrecking_ball",
    "scorch",
    "fire_dart"
  ]);
  expect(() => tg.checkAction({ type: "play", card: "wither" })).toThrow();
  expect(() =>
    tg.checkAction({ type: "play", card: "wrecking_ball" })
  ).toThrow();
  expect(() => tg.checkAction({ type: "play", card: "scorch" })).toThrow();
  expect(() => tg.checkAction({ type: "play", card: "fire_dart" })).toThrow();
});

test("With a neutral hero, can cast neutral spells, plus colored minor spells at a cost", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, [
      "wither",
      "wrecking_ball",
      "scorch",
      "fire_dart"
    ])
    .insertEntity(testp1Id, "troq_bashar");
  expect(() => tg.checkAction({ type: "play", card: "wither" })).not.toThrow();
  expect(() =>
    tg.checkAction({ type: "play", card: "wrecking_ball" })
  ).not.toThrow();
  expect(() => tg.checkAction({ type: "play", card: "fire_dart" })).toThrow();
  tg.setGold(testp1Id, 3);
  expect(() => tg.checkAction({ type: "play", card: "scorch" })).toThrow();
  tg.setGold(testp1Id, 4);
  expect(() => tg.checkAction({ type: "play", card: "scorch" })).not.toThrow();
  tg.playAction({ type: "play", card: "scorch" });
  expect(tg.state.players[testp1Id].gold).toEqual(0);
});

test("With a colored hero, can cast neutral and on-color minor spells plus own spells", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, [
      "wither",
      "wrecking_ball",
      "scorch",
      "fire_dart"
    ])
    .insertEntity(testp1Id, "jaina_stormborne");
  expect(() => tg.checkAction({ type: "play", card: "wither" })).not.toThrow();
  expect(() =>
    tg.checkAction({ type: "play", card: "wrecking_ball" })
  ).toThrow();
  expect(() => tg.checkAction({ type: "play", card: "scorch" })).not.toThrow();
  expect(() =>
    tg.checkAction({ type: "play", card: "fire_dart" })
  ).not.toThrow();
});

test("With two heroes, can cast spells belonging to either", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, [
      "wither",
      "wrecking_ball",
      "scorch",
      "fire_dart"
    ])
    .insertEntities(testp1Id, ["jaina_stormborne", "troq_bashar"]);
  expect(() => tg.checkAction({ type: "play", card: "wither" })).not.toThrow();
  expect(() =>
    tg.checkAction({ type: "play", card: "wrecking_ball" })
  ).not.toThrow();
  expect(() => tg.checkAction({ type: "play", card: "scorch" })).not.toThrow();
  expect(() =>
    tg.checkAction({ type: "play", card: "fire_dart" })
  ).not.toThrow();
});

test("Can cast an ultimate spell with a hero who maxed last turn", () => {
  const tg = new TestGame().insertEntity(testp1Id, "river_montoya");
  const [river] = tg.insertedEntityIds;
  tg.playActions([
    { type: "level", hero: river, amount: 4 },
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  tg.putCardsInHand(testp1Id, ["appel_stomp"]);
  expect(() =>
    tg.checkAction({ type: "play", card: "appel_stomp" })
  ).not.toThrow();
});

test("Can't cast an ultimate spell with a hero who is not maxed", () => {
  const tg = new TestGame().insertEntity(testp1Id, "river_montoya");
  tg.putCardsInHand(testp1Id, ["appel_stomp"]);
  expect(() => tg.checkAction({ type: "play", card: "appel_stomp" })).toThrow(
    "max"
  );
});

test("Can't cast an ultimate spell with a hero who maxed this turn", () => {
  const tg = new TestGame().insertEntity(testp1Id, "river_montoya");
  const [river] = tg.insertedEntityIds;
  tg.setGold(testp1Id, 5);
  tg.playActions([{ type: "level", hero: river, amount: 4 }]);
  tg.putCardsInHand(testp1Id, ["appel_stomp"]);
  expect(() => tg.checkAction({ type: "play", card: "appel_stomp" })).toThrow(
    "max"
  );
});

test("Can't cast an ultimate spell unless correct hero is maxed", () => {
  const tg = new TestGame().insertEntities(testp1Id, [
    "river_montoya",
    "troq_bashar"
  ]);
  const [river, troq] = tg.insertedEntityIds;
  tg.setGold(testp1Id, 10);
  tg.playActions([
    { type: "level", hero: river, amount: 4 },
    { type: "endTurn" },
    { type: "endTurn" }
  ]);
  tg.putCardsInHand(testp1Id, ["final_smash"]);
  expect(() => tg.checkAction({ type: "play", card: "final_smash" })).toThrow(
    "max"
  );
});
