import { getGameWithUnits, findEntityIds, playActions } from "../testutil";

test("Flying unit attacking non-flying unit takes no damage", () => {
  const s0 = getGameWithUnits(["eggship"], ["regularsized_rhinoceros"]);
  const es = findEntityIds(s0, e => e.card == "eggship")[0];
  const rr = findEntityIds(s0, e => e.card == "regularsized_rhinoceros")[0];
  const s1 = playActions(s0, [{ type: "attack", attacker: es, target: rr }]);
  expect(s1.entities[es].damage).toEqual(0);
  expect(s1.entities[rr].damage).toEqual(4);
});
