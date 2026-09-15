import { CheckpointDecision, CheckpointResponsePolicy } from '../services/checkpoint-response.policy';
import { ReplyMode } from './reply-mode.vo';

export type PersistDecision = 'set' | 'clear' | 'leaveUnchanged';
export type StepDecision = 'resetToZero' | 'advance' | 'repeat' | 'keep' | 'irrelevant';

export class ReplyPlan {
  private constructor(
    readonly mode: ReplyMode,
    readonly persist: PersistDecision,
    readonly slugToSet: string | null,
    readonly step: StepDecision,
    readonly switchOccurred: boolean,
  ) {}

  static ragSet(slug: string, step: StepDecision, switchOccurred: boolean): ReplyPlan {
    return new ReplyPlan('rag', 'set', slug, step, switchOccurred);
  }

  static ragContinue(step: StepDecision): ReplyPlan {
    return new ReplyPlan('rag', 'leaveUnchanged', null, step, false);
  }

  static clarify(): ReplyPlan {
    return new ReplyPlan('clarify', 'leaveUnchanged', null, 'keep', false);
  }

  static general(switchOccurred: boolean): ReplyPlan {
    return new ReplyPlan('general', 'clear', null, 'irrelevant', switchOccurred);
  }

  resolvedTopicSlug(persisted: string | null): string | null {
    if (this.persist === 'set') {
      return this.slugToSet;
    }
    if (this.persist === 'clear') {
      return null;
    }
    return persisted;
  }

  nextCurrentStep(
    currentStep: number,
    checkpointDecision: CheckpointDecision,
    stepCount: number,
    checkpoints: CheckpointResponsePolicy,
  ): number {
    if (this.step === 'resetToZero' || this.step === 'irrelevant') {
      return 0;
    }
    if (this.step === 'keep') {
      return currentStep;
    }
    const decision: CheckpointDecision = this.step === 'advance' ? 'advance' : 'repeat';
    return checkpoints.resolveNextStep(currentStep, decision, stepCount);
  }
}
