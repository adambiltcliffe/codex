import { TestGame, testp1Id, testp2Id } from "../../testutil";
import { partitionObliterateTargets } from "./obliterate";

test("Correct behaviour of (internal) function partitionObliterateTargets", () => {
  const fakeTf = { current: { name: "Tenderfoot", tech: 0 } };
  const fakeBt = { current: { name: "Brick Thief", tech: 0 } };
  const fakeIm = { current: { name: "Iron Man", tech: 1 } };
  const fakeNf = { current: { name: "Nimble Fencer", tech: 1 } };
  const fakeEs = { current: { name: "Eggship", tech: 2 } };
  const fakeLl = { current: { name: "Leaping Lizard", tech: 2 } };
  const fakeSp = { current: { name: "Sneaky Pig", tech: 2 } };
  const fakeTd = { current: { name: "Trojan Duck", tech: 3 } };
  const fakeBm = { current: { name: "Blademaster", tech: 3 } };
  expect(partitionObliterateTargets([fakeTf, fakeIm, fakeEs], 2)).toEqual([
    [fakeTf, fakeIm],
    []
  ]);
  expect(partitionObliterateTargets([fakeTf, fakeIm, fakeNf], 2)).toEqual([
    [fakeTf],
    [fakeIm, fakeNf]
  ]);
  expect(partitionObliterateTargets([fakeNf, fakeIm, fakeTf], 2)).toEqual([
    [fakeTf],
    [fakeNf, fakeIm]
  ]);
  expect(partitionObliterateTargets([fakeTf, fakeBt], 1)).toEqual([
    [],
    [fakeTf, fakeBt]
  ]);
  expect(
    partitionObliterateTargets(
      [fakeTd, fakeTf, fakeIm, fakeEs, fakeLl, fakeBm],
      4
    )
  ).toEqual([[fakeTf, fakeIm, fakeEs, fakeLl], []]);
  expect(
    partitionObliterateTargets(
      [fakeTd, fakeTf, fakeIm, fakeEs, fakeLl, fakeBm, fakeSp],
      4
    )
  ).toEqual([[fakeTf, fakeIm], [fakeEs, fakeLl, fakeSp]]);
});

/*test("Testing the fake version of obliterate", () => {
  const tg = new TestGame()
    .insertEntities(testp1Id, ["tenderfoot", "iron_man", "sneaky_pig"])
    .insertEntity(testp2Id, "trojan_duck");
  const p1base = tg.findBaseId(testp1Id);
  const [tf, im, sp, td] = tg.insertedEntityIds;
  tg.playActions([
    { type: "endTurn" },
    { type: "attack", attacker: td, target: p1base }
  ]);
  tg.queueByPath("cardInfo.trojan_duck.abilities[0]");
  expect(tg.getLegalChoices().sort()).toEqual([tf, im, sp, td].sort());
  tg.playAction({ type: "choice", target: sp });
  expect(tg.state.entities[sp]).toBeUndefined();
  expect(tg.state.log).toContain("Sneaky Pig dies.");
});*/
