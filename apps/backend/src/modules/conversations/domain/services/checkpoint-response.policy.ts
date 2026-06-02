export type CheckpointDecision = 'advance' | 'repeat' | 'unchanged';

const AFFIRMATIVE =
  /^(sim|s|yes|y|ok|consegui|conseguir|pronto|já|ja|feito|certo|isso|uhum)\b/i;
const NEGATIVE =
  /^(não|nao|n|no|nope|ainda\s+não|ainda\s+nao|não\s+consegui|nao\s+consegui|travei|difícil|dificil)\b/i;

export class CheckpointResponsePolicy {
  evaluate(userMessage: string): CheckpointDecision {
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

  resolveNextStep(currentStep: number, decision: CheckpointDecision, maxSteps: number): number {
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
