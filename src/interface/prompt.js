import {
  currentStepDefinition,
  getLegalChoicesForCurrentTrigger
} from "../triggers";
import { targetMode } from "../cardinfo";
import { getObliterateTargets } from "../cardinfo/abilities/obliterate";
import { getAP } from "../util";

export const getCurrentPromptMode = state => {
  const stepDef = currentStepDefinition(state);
  return stepDef.targetMode;
};

export const getCurrentPrompt = state => {
  const stepDef = currentStepDefinition(state);
  return stepDef.prompt;
};

export const getCurrentPromptCountAndTargets = state => {
  const stepDef = currentStepDefinition(state);
  switch (stepDef.targetMode) {
    case targetMode.single: {
      return { count: 1, options: getLegalChoicesForCurrentTrigger(state) };
    }
    case targetMode.multiple: {
      return {
        count: stepDef.targetCount,
        options: getLegalChoicesForCurrentTrigger(state)
      };
    }
    case targetMode.obliterate: {
      const dpId = state.currentAttack.defendingPlayer;
      const [definitely, maybe] = getObliterateTargets(
        state,
        dpId,
        stepDef.targetCount
      );
      return {
        count: stepDef.targetCount - definitely.length,
        options: maybe.map(e => e.id),
        fixed: definitely.map(e => e.id)
      };
    }
  }
};

export const getCurrentPromptModalOptions = state => {
  const stepDef = currentStepDefinition(state);
  return stepDef.options;
};

export const getCurrentPromptCountAndCodex = state => {
  const ap = getAP(state);
  const stepDef = currentStepDefinition(state);
  return { count: stepDef.targetCount, options: ap.codex };
};
