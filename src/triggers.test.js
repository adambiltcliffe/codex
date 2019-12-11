import { colors, types } from "./cardinfo/constants";
import log from "./log";
import {
  getNewGame,
  putCardInHand,
  testp1Id,
  playActions,
  TestGame,
  testp2Id
} from "./testutil";
import { triggerDefinitions } from "./triggers";

beforeAll(() => {
  triggerDefinitions.cardInfo["_test_single_trigger"] = {
    color: colors.neutral,
    tech: 0,
    name: "Test Unit (Single Trigger)",
    type: types.unit,
    cost: 2,
    attack: 2,
    hp: 2,
    abilities: [
      {
        triggerOnOwnArrival: true,
        action: ({ state }) => {
          log.add(state, "Single trigger test");
        }
      }
    ]
  };

  triggerDefinitions.cardInfo["_test_double_trigger"] = {
    color: colors.neutral,
    tech: 0,
    name: "Test Unit (Double Trigger)",
    type: types.unit,
    cost: 2,
    attack: 2,
    hp: 2,
    abilities: [
      {
        triggerOnOwnArrival: true,
        steps: [
          {
            action: ({ state }) => {
              log.add(state, "Double trigger test 1");
            }
          },
          {
            action: ({ state }) => {
              log.add(state, "Double trigger test 2");
            }
          }
        ]
      }
    ]
  };
});

test("Single arrival trigger", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "_test_single_trigger");
  const s1 = playActions(s0, [{ type: "play", card: "_test_single_trigger" }]);
  expect(s1.log).toContain("Single trigger test");
});

test("Double arrival trigger", () => {
  const s0 = getNewGame();
  putCardInHand(s0, testp1Id, "_test_double_trigger");
  const s1 = playActions(s0, [{ type: "play", card: "_test_double_trigger" }]);
  expect(s1.log).toContain("Double trigger test 1");
  expect(s1.log).toContain("Double trigger test 2");
});

test("Triggers arising between steps of a multi-step spell", () => {
  // regression from the first ever game played on techphase.cc!
  const tg = new TestGame()
    .insertEntity(testp1Id, "troq_bashar")
    .insertEntities(testp2Id, ["tenderfoot", "nimble_fencer", "nimble_fencer"]);
  const [troq, tf, nf1, nf2] = tg.insertedEntityIds;
  tg.modifyEntity(troq, { level: 8, maxedSince: -1 })
    .putCardsOnTopOfDeck(testp1Id, ["final_smash"])
    .playActions([
      { type: "endTurn" },
      { type: "endTurn", patrollers: [null, null, tf, null, null] },
      { type: "play", card: "final_smash" }
    ]);
  expect(tg.state.log).toEqual([
    `\${${testp1Id}} plays Final Smash.`,
    "Choose a tech 0 unit to destroy: Only one legal choice.",
    "Tenderfoot dies."
  ]);
  // This is a bug but right now lets us fix another bug
  expect(tg.state.newTriggers).toHaveLength(1);
  expect(() => tg.checkAction({ type: "queue", index: 0 })).not.toThrow();
});
