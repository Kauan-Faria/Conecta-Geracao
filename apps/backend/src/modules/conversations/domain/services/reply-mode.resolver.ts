import { CheckpointDecision } from './checkpoint-response.policy';
import { TopicMatch } from '../value-objects/topic-match.vo';
import { ClarificationStreak } from '../value-objects/clarification-streak.vo';
import { MessageSubstance } from '../value-objects/message-substance.vo';
import { ReplyPlan, StepDecision } from '../value-objects/reply-plan.vo';
import { TopicSwitchPolicy } from './topic-switch.policy';

export interface ResolveReplyModeInput {
  match: TopicMatch;
  persisted: string | null;
  substance: MessageSubstance;
  streak: ClarificationStreak;
  isCheckpoint: boolean;
  checkpointDecision: CheckpointDecision;
}

export class ReplyModeResolver {
  private readonly topicSwitch = new TopicSwitchPolicy();

  resolve(input: ResolveReplyModeInput): ReplyPlan {
    const persisted = input.persisted?.trim() || null;
    const { match, streak, substance, isCheckpoint, checkpointDecision } = input;

    if (isCheckpoint && persisted && streak.count === 0) {
      const step: StepDecision =
        checkpointDecision === 'advance'
          ? 'advance'
          : checkpointDecision === 'repeat'
            ? 'repeat'
            : 'keep';
      return ReplyPlan.ragContinue(step);
    }

    if (match.isHigh && match.slug) {
      const decision = this.topicSwitch.decide({
        match,
        persisted,
        isTutorialCheckpoint: false,
      });
      return ReplyPlan.ragSet(match.slug, decision.step, decision.occurred);
    }

    if (streak.isExhausted) {
      return ReplyPlan.general(Boolean(persisted));
    }

    if (streak.isActive) {
      return ReplyPlan.clarify();
    }

    if (match.confidence === 'tie' || match.confidence === 'low') {
      return ReplyPlan.clarify();
    }

    if (match.confidence === 'none' && substance === 'outOfCatalog') {
      return ReplyPlan.general(Boolean(persisted));
    }

    if (match.confidence === 'none' && !persisted) {
      return ReplyPlan.clarify();
    }

    return ReplyPlan.ragContinue('keep');
  }
}
