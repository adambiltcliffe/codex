import { TestGame, testp1Id } from "../testutil";
import { hasKeyword, readiness } from "./abilities/keywords";

// Oni: right stats on each turn (frenzy, bands)
// Oni: readiness at midband
// Oni: max level trigger on own turn
// Oni: max level trigger on opp turn

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
});
