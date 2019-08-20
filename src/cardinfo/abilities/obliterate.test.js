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

test("Obliterate destroys correct number of targets when choice is forced", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "pirate_gunship")
    .insertEntities(testp2Id, [
      "tenderfoot",
      "eggship",
      "iron_man",
      "blademaster"
    ]);
  const p2base = tg.findBaseId(testp2Id);
  const [pg, tf, es, im, bm] = tg.insertedEntityIds;
  tg.playAction({ type: "attack", attacker: pg, target: p2base });
  expect(tg.state.log).toContain("Tenderfoot and Iron Man are obliterated.");
  expect(tg.state.log).toContain("Tenderfoot dies.");
  expect(tg.state.log).toContain("Iron Man dies.");
});

test("Obliterate destroys as much as possible if not enough targets exist", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "pirate_gunship")
    .insertEntity(testp2Id, "eggship");
  const p2base = tg.findBaseId(testp2Id);
  const [pg, es] = tg.insertedEntityIds;
  tg.playAction({ type: "attack", attacker: pg, target: p2base });
  expect(tg.state.log).toContain("Eggship is obliterated.");
  expect(tg.state.log).toContain("Eggship dies.");
});

test("Obliterate lets you choose targets if there are several options", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "pirate_gunship")
    .insertEntities(testp2Id, [
      "tenderfoot",
      "older_brother",
      "brick_thief",
      "eggship"
    ]);
  const p2base = tg.findBaseId(testp2Id);
  const [pg, tf, ob, bt, es] = tg.insertedEntityIds;
  tg.playAction({ type: "attack", attacker: pg, target: p2base });
  expect(() =>
    tg.checkAction({ type: "choice", targets: [tf, ob, bt] })
  ).toThrow("Wrong number");
  expect(() => tg.checkAction({ type: "choice", targets: [tf, es] })).toThrow(
    "not among valid choices"
  );
  expect(() =>
    tg.checkAction({ type: "choice", targets: [tf, bt] })
  ).not.toThrow();
  tg.playAction({ type: "choice", targets: [tf, bt] });
  expect(tg.state.log).toContain("Tenderfoot and Brick Thief are obliterated.");
  expect(tg.state.log).toContain("Tenderfoot dies.");
  expect(tg.state.log).toContain("Brick Thief dies.");
});

test("Only have to choose to unforced ones if some units must die", () => {
  const tg = new TestGame()
    .insertEntity(testp1Id, "pirate_gunship")
    .insertEntities(testp2Id, [
      "iron_man",
      "tenderfoot",
      "sneaky_pig",
      "revolver_ocelot"
    ]);
  const p2base = tg.findBaseId(testp2Id);
  const [pg, im, tf, sp, ro] = tg.insertedEntityIds;
  tg.playAction({ type: "attack", attacker: pg, target: p2base });
  expect(() => tg.checkAction({ type: "choice", targets: [tf, im] })).toThrow(
    "Wrong number"
  );
  expect(() => tg.checkAction({ type: "choice", targets: [sp] })).toThrow(
    "not among valid choices"
  );
  expect(() => tg.checkAction({ type: "choice", targets: [ro] })).not.toThrow();
  tg.playAction({ type: "choice", targets: [ro] });
  expect(tg.state.log).toContain(
    "Tenderfoot and Revolver Ocelot are obliterated."
  );
  expect(tg.state.log).toContain("Tenderfoot dies.");
  expect(tg.state.log).toContain("Revolver Ocelot dies.");
});
