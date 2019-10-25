import cardInfo from "../cardinfo";

export { makeAbilityText } from "./render-entity";
export { describePhase, describePatrolSlot, describeFixture } from "./describe";

export function getCardInfo(card) {
  return cardInfo[card];
}
