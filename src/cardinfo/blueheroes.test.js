import { TestGame, testp1Id, findEntityIds, testp2Id } from "../testutil";
import { hasKeyword, readiness } from "./abilities/keywords";

test("Onimaru stats on own and other turns", () => {
  const tg = new TestGame().insertEntity(testp1Id, "general_onimaru");
  const [oni] = tg.insertedEntityIds;
  expect(tg.state.entities[oni].current).toMatchObject({ attack: 3, hp: 3 });
  expect(hasKeyword(tg.state.entities[oni].current, readiness)).toBeFalsy();
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[oni].current).toMatchObject({ attack: 2, hp: 3 });
  tg.playActions([
    { type: "endTurn" },
    { type: "level", hero: oni, amount: 4 }
  ]);
  expect(tg.state.entities[oni].current).toMatchObject({ attack: 4, hp: 4 });
  expect(hasKeyword(tg.state.entities[oni].current, readiness)).toBeTruthy();
  expect(findEntityIds(tg.state, e => e.card == "soldier_token")).toHaveLength(
    0
  );
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[oni].current).toMatchObject({ attack: 3, hp: 4 });
  tg.playActions([
    { type: "endTurn" },
    { type: "level", hero: oni, amount: 3 }
  ]);
  expect(tg.state.entities[oni].current).toMatchObject({ attack: 5, hp: 5 });
  tg.playAction({ type: "endTurn" });
  expect(tg.state.entities[oni].current).toMatchObject({ attack: 4, hp: 5 });
  expect(hasKeyword(tg.state.entities[oni].current, readiness)).toBeTruthy();
  expect(findEntityIds(tg.state, e => e.card == "soldier_token")).toHaveLength(
    3
  );
});

test("Oni creates Soldiers under your control when maxed on your turn", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "general_onimaru")
    .setGold(testp1Id, 7);
  const [oni] = tg.insertedEntityIds;
  tg.playAction({ type: "level", hero: oni, amount: 7 });
  const sts = findEntityIds(tg.state, e => e.card == "soldier_token");
  expect(sts).toHaveLength(3);
  for (let ii = 0; ii < 3; ii++) {
    expect(tg.state.entities[sts[ii]].current.controller).toEqual(testp1Id);
  }
  expect(tg.state.log).toContain(
    "General Onimaru creates three Soldier tokens."
  );
});

test("Oni creates Soldiers under your control when maxed on enemy turn", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "general_onimaru")
    .insertEntity(testp2Id, "captain_zane")
    .setGold(testp1Id, 6);
  const [oni, zane] = tg.insertedEntityIds;
  tg.playActions([
    { type: "level", hero: oni, amount: 6 },
    { type: "endTurn" },
    { type: "attack", attacker: zane, target: oni }
  ]);
  expect(tg.state.log).toContain(
    "Choose a hero to gain 2 levels: Only one legal choice."
  );
  expect(tg.state.entities[oni].level).toEqual(8);
  const sts = findEntityIds(tg.state, e => e.card == "soldier_token");
  expect(sts).toHaveLength(3);
  for (let ii = 0; ii < 3; ii++) {
    expect(tg.state.entities[sts[ii]].current.controller).toEqual(testp1Id);
  }
});
