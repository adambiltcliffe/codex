import { TestGame, testp1Id } from "./testutil";
import { specs } from "./cardinfo";
import { buildSingleCodex } from "./codex";
import { wrapSecrets } from "./targets";
import { currentTriggerDefinition } from "./triggers";

const doublePass = [{ type: "endTurn" }, { type: "endTurn" }];

test("Can tech first card from codex", () => {
  const tg = new TestGame()
    .setCodexBySpec(testp1Id, specs.bashing)
    .playActions(doublePass);
  expect(tg.state.currentTrigger.path).toEqual("triggerInfo.tech");
  expect(currentTriggerDefinition(tg.state).text).toEqual(
    "Add teched cards to discard."
  );
  const indices = wrapSecrets(
    tg.state,
    testp1Id,
    [0, 0],
    tg.state.players[testp1Id].codex.length
  );
  tg.playAction({ type: "choice", indices });
  expect(tg.state.players[testp1Id].discard[5]).toEqual("wrecking_ball");
  expect(tg.state.players[testp1Id].discard[6]).toEqual("wrecking_ball");
});

test("Can tech cards, as long as they're still in codex", () => {
  const tg = new TestGame();
  tg.setCodexBySpec(testp1Id, specs.bashing);
  tg.playActions(doublePass);
  let n = tg.state.players[testp1Id].codex.length;
  const indices = wrapSecrets(tg.state, testp1Id, [4, 5], n);
  tg.playAction({ type: "choice", indices });
  expect(tg.state.players[testp1Id].discard).toContain("iron_man");
  expect(tg.state.players[testp1Id].discard).toContain("revolver_ocelot");
  expect(tg.state.players[testp1Id].codex[4]).toEqual({
    card: "iron_man",
    n: 1
  });
  expect(tg.state.players[testp1Id].codex[5]).toEqual({
    card: "revolver_ocelot",
    n: 1
  });
  tg.playActions(doublePass);
  n = tg.state.players[testp1Id].codex.length;
  expect(() =>
    tg.checkAction({
      type: "choice",
      indices: wrapSecrets(tg.state, testp1Id, [4, 4], n)
    })
  ).toThrow("Not enough");
  expect(() =>
    tg.checkAction({
      type: "choice",
      indices: wrapSecrets(tg.state, testp1Id, [5, 5], n)
    })
  ).toThrow("Not enough");
  expect(() =>
    tg.checkAction({
      type: "choice",
      indices: wrapSecrets(tg.state, testp1Id, [4, 5], n)
    })
  ).not.toThrow();
});

test("Can't tech cards if all copies teched already'", () => {
  const tg = new TestGame();
  tg.setCodex(testp1Id, [
    { card: "iron_man", n: 0 },
    { card: "eggship", n: 2 }
  ]);
  tg.playActions(doublePass);
  let n = tg.state.players[testp1Id].codex.length;
  const indices = wrapSecrets(tg.state, testp1Id, [0, 1], n);
  expect(() => tg.checkAction({ type: "choice", indices })).toThrow(
    "Not enough"
  );
});

test("Can't tech more or less than 2 cards while workers < 10", () => {
  const tg = new TestGame()
    .setCodexBySpec(testp1Id, specs.bashing)
    .playActions(doublePass);
  expect(tg.state.currentTrigger.path).toEqual("triggerInfo.tech");
  expect(() => tg.checkAction({ type: "choice", indices: [0] })).toThrow(
    "Not enough"
  );
  expect(() => tg.checkAction({ type: "choice", indices: [0, 1, 2] })).toThrow(
    "Too many"
  );
});

test("Can tech less than 2 cards when workers >= 10", () => {
  const tg = new TestGame()
    .setCodexBySpec(testp1Id, specs.bashing)
    .setWorkers(testp1Id, 10)
    .playActions(doublePass);
  expect(tg.state.currentTrigger.path).toEqual("triggerInfo.tech");
  expect(() => tg.checkAction({ type: "choice", indices: [] })).not.toThrow();
  expect(() => tg.checkAction({ type: "choice", indices: [0] })).not.toThrow();
  expect(() => tg.checkAction({ type: "choice", indices: [0, 1, 2] })).toThrow(
    "Too many"
  );
});

test("If no cards left in codex, skip tech phase", () => {
  const emptyCodex = buildSingleCodex(specs.bashing).map(({ card }) => ({
    card,
    n: 0
  }));
  const tg = new TestGame()
    .setCodex(testp1Id, emptyCodex)
    .playActions(doublePass);
  expect(tg.state.currentTrigger).toBeNull();
});

test("If one card left in codex, player must tech it", () => {
  // We don't bother to auto-resolve the tech trigger in this case because this
  // situation should be absurdly rare
  const nearlyEmptyCodex = buildSingleCodex(specs.bashing).map(({ card }) => ({
    card,
    n: 0
  }));
  nearlyEmptyCodex[0].n = 1;
  const tg = new TestGame()
    .setCodex(testp1Id, nearlyEmptyCodex)
    .playActions(doublePass);
  expect(tg.state.currentTrigger.path).toEqual("triggerInfo.tech");
  expect(() => tg.checkAction({ type: "choice", indices: [] })).toThrow(
    "Not enough"
  );
  const indices = wrapSecrets(
    tg.state,
    testp1Id,
    [0],
    tg.state.players[testp1Id].codex.length
  );
  expect(() => tg.checkAction({ type: "choice", indices })).not.toThrow();
});
