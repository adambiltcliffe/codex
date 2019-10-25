import cardInfo from "../cardinfo";

export { makeAbilityText } from "./render-entity";
export { describePhase, describePatrolSlot, describeFixture } from "./describe";
export { makeWorkerAction, makeTechChoiceAction } from "./secrets";
export {
  isLegalAction,
  canTakeWorkerAction,
  legalAttackActionTree,
  legalActivateActionTree,
  legalPlayActions,
  legalSummonActions,
  legalLevelActionTree,
  legalBuildActions
} from "./legal-actions";

export function getCardInfo(card) {
  return cardInfo[card];
}
