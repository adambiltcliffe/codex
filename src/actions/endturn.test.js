import { testp1Id, findEntityIds, TestGame } from "../testutil";
import { fixtureNames } from "../fixtures";

test("Acceptable patrollers", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["iron_man", "iron_man"])
    .setGold(testp1Id, 20)
    .insertFixture(testp1Id, fixtureNames.tech1)
    .playActions([
      { type: "play", card: "iron_man" },
      { type: "play", card: "iron_man" }
    ]);
  const p1base = tg.findBaseId(testp1Id);
  const ims = findEntityIds(tg.state, e => e.card == "iron_man");
  expect(ims).toHaveLength(2);
  expect(() => tg.checkAction({ type: "endTurn", patrollers: [] })).toThrow(
    "5"
  );
  expect(() =>
    tg.checkAction({
      type: "endTurn",
      patrollers: [null, null, null, ims[0], ims[0]]
    })
  ).toThrow("duplicate");
  expect(() =>
    tg.checkAction({
      type: "endTurn",
      patrollers: [null, null, null, ims[0], p1base]
    })
  ).toThrow("units and heroes");
  tg.playAction({
    type: "endTurn",
    patrollers: [null, null, null, ims[0], ims[1]]
  });
  expect(tg.state.players[testp1Id].patrollerIds).toEqual([
    null,
    null,
    null,
    ims[0],
    ims[1]
  ]);
  expect(tg.state.log).toContain(
    "${test_player1} ends their main phase, patrolling with Iron Man (Technician) and Iron Man (Lookout)."
  );
});
