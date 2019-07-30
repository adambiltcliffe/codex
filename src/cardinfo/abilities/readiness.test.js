import {
  getGameWithUnits,
  findEntityIds,
  testp2Id,
  playActions
} from "../../testutil";
import { fixtureNames } from "../../fixtures";
import CodexGame from "../../codex";
import produce from "immer";

test("Unit with readiness can attack without exhausting but only once", () => {
  const s0 = getGameWithUnits(["argonaut"], []);
  const a = findEntityIds(s0, e => e.card == "argonaut")[0];
  const p2base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  expect(s0.entities[a].ready).toBeTruthy();
  const s1 = playActions(s0, [{ type: "attack", attacker: a, target: p2base }]);
  expect(s1.entities[a].ready).toBeTruthy();
  expect(() =>
    CodexGame.checkAction(s1, { type: "attack", attacker: a, target: p2base })
  ).toThrow();
});

test("Unit with readiness still can't attack if exhausted", () => {
  const s0 = getGameWithUnits(["argonaut"], []);
  const a = findEntityIds(s0, e => e.card == "argonaut")[0];
  const p2base = findEntityIds(
    s0,
    e => e.fixture == fixtureNames.base && e.owner == testp2Id
  )[0];
  const s1 = produce(s0, d => {
    d.entities[a].ready = false;
  });
  expect(() =>
    CodexGame.checkAction(s1, { type: "attack", attacker: a, target: p2base })
  ).toThrow();
});
