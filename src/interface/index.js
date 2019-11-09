import cardInfo from "../cardinfo";

export { makeAbilityText } from "./render-entity";
export {
  describePhase,
  describePatrolSlot,
  describeFixture,
  describeEntityAbility,
  describeQueueItem
} from "./describe";
export { makeWorkerAction, makeTechChoiceAction } from "./secrets";
export {
  requiredActionType,
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
export {
  getCurrentPromptMode,
  getCurrentPromptCountAndTargets,
  getCurrentPromptModalOptions,
  getCurrentPrompt
} from "./prompt";

export function getCardInfo(card) {
  return cardInfo[card];
}
