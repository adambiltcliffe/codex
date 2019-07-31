import {
  getNewGame,
  playActions,
  findEntityIds,
  testp1Id,
  getGameWithUnits
} from "./testutil";
import { getCurrentValues } from "./entities";
import CodexGame from "./codex";

test("Summoning hero and levelling up", () => {
  const s0 = getNewGame();
  s0.players[testp1Id].gold = 9;
  const s1 = playActions(s0, [{ type: "summon", hero: "troq_bashar" }]);
  const troq = findEntityIds(s1, e => e.card == "troq_bashar")[0];
  expect(s1.players[testp1Id].gold).toEqual(7);
  expect(getCurrentValues(s1, troq).attack).toEqual(2);
  expect(getCurrentValues(s1, troq).hp).toEqual(3);
  expect(getCurrentValues(s1, troq).abilities.length).toEqual(0);
  const s2 = playActions(s1, [{ type: "level", hero: troq, amount: 4 }]);
  expect(s2.players[testp1Id].gold).toEqual(3);
  expect(getCurrentValues(s2, troq).attack).toEqual(3);
  expect(getCurrentValues(s2, troq).hp).toEqual(4);
  expect(getCurrentValues(s2, troq).abilities.length).toEqual(1);
  expect(s2.log).not.toContain("Troq Bashar is fully healed.");
  const s3 = playActions(s2, [{ type: "level", hero: troq, amount: 3 }]);
  expect(s3.players[testp1Id].gold).toEqual(0);
  expect(getCurrentValues(s3, troq).attack).toEqual(4);
  expect(getCurrentValues(s3, troq).hp).toEqual(5);
  expect(getCurrentValues(s3, troq).abilities.length).toEqual(2);
  expect(s3.log).not.toContain("Troq Bashar is fully healed.");
});

test("Can't level hero past max", () => {
  const s0 = getNewGame();
  s0.players[testp1Id].gold = 20;
  const s1 = playActions(s0, [{ type: "summon", hero: "troq_bashar" }]);
  const troq = findEntityIds(s1, e => e.card == "troq_bashar")[0];
  expect(() =>
    CodexGame.checkAction(s1, { type: "level", hero: troq, amount: 7 })
  ).not.toThrow();
  expect(() =>
    CodexGame.checkAction(s1, { type: "level", hero: troq, amount: 8 })
  ).toThrow();
});

test("Can't level hero without paying for it", () => {
  const s0 = getNewGame();
  const s1 = playActions(s0, [{ type: "summon", hero: "troq_bashar" }]);
  const troq = findEntityIds(s1, e => e.card == "troq_bashar")[0];
  expect(() =>
    CodexGame.checkAction(s1, { type: "level", hero: troq, amount: 2 })
  ).not.toThrow();
  expect(() =>
    CodexGame.checkAction(s1, { type: "level", hero: troq, amount: 3 })
  ).toThrow();
});

test("Levelling up a hero to mid/maxband heals all damage", () => {
  const s0 = getGameWithUnits([], ["older_brother", "iron_man"]);
  const s1 = playActions(s0, [{ type: "summon", hero: "troq_bashar" }]);
  const troq = findEntityIds(s1, e => e.card == "troq_bashar")[0];
  const ob = findEntityIds(s1, e => e.card == "older_brother")[0];
  const im = findEntityIds(s1, e => e.card == "iron_man")[0];
  const s2 = playActions(s1, [
    { type: "endTurn" },
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: ob },
    { type: "level", hero: troq, amount: 4 }
  ]);
  expect(s2.entities[troq].damage).toEqual(0);
  expect(s2.log).toContain("Troq Bashar is fully healed.");
  const s3 = playActions(s2, [
    { type: "endTurn" },
    { type: "endTurn" },
    { type: "attack", attacker: troq, target: im },
    { type: "level", hero: troq, amount: 3 }
  ]);
  expect(s3.entities[troq].damage).toEqual(0);
  expect(s3.entities[im].damage).toEqual(3);
  expect(s3.log).toContain("Troq Bashar is fully healed.");
});
