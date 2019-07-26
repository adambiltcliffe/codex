import cardInfo from "./cardinfo";
import { colors, types } from "./cardinfo/constants";
import log from "./log";
import { getNewGame, putCardInHand, testp1Id, playActions } from "./testutil";

beforeAll(() => {
  cardInfo["_test_single_trigger"] = {
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

  cardInfo["_test_double_trigger"] = {
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
