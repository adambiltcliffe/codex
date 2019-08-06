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
