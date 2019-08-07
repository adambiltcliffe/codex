import { TestGame, testp1Id, testp2Id } from "./testutil";
import { hasKeyword, haste } from "./cardinfo/abilities/keywords";

test("Destroying an entity with a 'destroy' effect updates state", () => {
  const tg = new TestGame()
    .putCardsInHand(testp1Id, ["the_boot"])
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, ["nimble_fencer", "tenderfoot"]);
  const [troq, nf, tf] = tg.insertedEntityIds;
  expect(hasKeyword(tg.state.entities[tf].current, haste)).toBeTruthy();
  tg.playActions([
    { type: "play", card: "the_boot" },
    { type: "choice", target: nf }
  ]);
  expect(hasKeyword(tg.state.entities[tf].current, haste)).toBeFalsy();
});
