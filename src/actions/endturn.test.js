import CodexGame from "../codex";
import {
  getNewGame,
  putCardInHand,
  testp1Id,
  playActions,
  findEntityIds
} from "../testutil";
import { fixtureNames } from "../fixtures";

test("Acceptable patrollers", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "iron_man");
  putCardInHand(s0, testp1Id, "iron_man");
  s0.players[testp1Id].gold = 20;
  const s1 = playActions(s0, [
    { type: "play", card: "iron_man" },
    { type: "play", card: "iron_man" }
  ]);
  const p1base = findEntityIds(
    s1,
    e => e.fixture == fixtureNames.base && e.owner == testp1Id
  )[0];
  const ims = findEntityIds(s1, e => e.card == "iron_man");
  expect(ims).toHaveLength(2);
  expect(() =>
    CodexGame.checkAction(s1, { type: "endTurn", patrollers: [] })
  ).toThrow();
  expect(() =>
    CodexGame.checkAction(s1, {
      type: "endTurn",
      patrollers: [null, null, null, ims[0], ims[0]]
    })
  ).toThrow();
  expect(() =>
    CodexGame.checkAction(s1, {
      type: "endTurn",
      patrollers: [null, null, null, ims[0], p1base]
    })
  ).toThrow();
  const s2 = playActions(s1, [
    { type: "endTurn", patrollers: [null, null, null, ims[0], ims[1]] }
  ]);
  expect(s2.players[testp1Id].patrollerIds).toEqual([
    null,
    null,
    null,
    ims[0],
    ims[1]
  ]);
  expect(s2.log).toContain(
    "${test_player1} ends their main phase, patrolling with Iron Man (Technician) and Iron Man (Lookout)."
  );
});
