"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointResponsePolicy = void 0;
const AFFIRMATIVE = /^(sim|s|yes|y|ok|consegui|conseguir|pronto|já|ja|feito|certo|isso|uhum)\b/i;
const NEGATIVE = /^(não|nao|n|no|nope|ainda\s+não|ainda\s+nao|não\s+consegui|nao\s+consegui|travei|difícil|dificil)\b/i;
class CheckpointResponsePolicy {
    evaluate(userMessage) {
        const trimmed = userMessage.trim();
        if (!trimmed) {
            return 'unchanged';
        }
        if (AFFIRMATIVE.test(trimmed)) {
            return 'advance';
        }
        if (NEGATIVE.test(trimmed)) {
            return 'repeat';
        }
        return 'unchanged';
    }
    resolveNextStep(currentStep, decision, maxSteps) {
        if (maxSteps <= 0) {
            return 0;
        }
        if (decision === 'advance') {
            return Math.min(currentStep + 1, maxSteps - 1);
        }
        if (decision === 'repeat') {
            return Math.max(currentStep - 1, 0);
        }
        return currentStep;
    }
}
exports.CheckpointResponsePolicy = CheckpointResponsePolicy;
//# sourceMappingURL=checkpoint-response.policy.js.map