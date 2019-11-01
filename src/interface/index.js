import cardInfo from "../cardinfo";

export { makeAbilityText } from "./render-entity";
export {
  describePhase,
  describePatrolSlot,
  describeFixture,
  describeEntityAbility,
  describeQueueItem,
  getCurrentPromptMode,
  getCurrentPromptOptions,
  getCurrentPrompt
} from "./describe";
export { makeWorkerAction, makeTechChoiceAction } from "./secrets";
export {
  isLegalAction,
  canTakeWorkerAction,
  legalAttackActionTree,
  legalActivateActionTree,
  legalPlayActions,
  legalSummonActions,
  legalLevelActionTree,
  legalBuildActions,
  legalPatrollers
} from "./legal-actions";

export function getCardInfo(card) {
  return cardInfo[card];
}
