import { TopicMatch } from '../value-objects/topic-match.vo';
import { StepDecision } from '../value-objects/reply-plan.vo';

export interface TopicSwitchDecision {
  occurred: boolean;
  fromSlug: string | null;
  toSlug: string | null;
  step: StepDecision;
}

export class TopicSwitchPolicy {
  decide(input: {
    match: TopicMatch;
    persisted: string | null;
    isTutorialCheckpoint: boolean;
  }): TopicSwitchDecision {
    const persisted = input.persisted?.trim() || null;

    if (input.isTutorialCheckpoint && persisted) {
      return { occurred: false, fromSlug: persisted, toSlug: persisted, step: 'keep' };
    }

    if (input.match.isHigh && input.match.slug) {
      const switched = Boolean(persisted) && input.match.slug !== persisted;
      return {
        occurred: switched,
        fromSlug: persisted,
        toSlug: input.match.slug,
        step: switched || !persisted ? 'resetToZero' : 'keep',
      };
    }

    return {
      occurred: false,
      fromSlug: persisted,
      toSlug: persisted,
      step: 'keep',
    };
  }
}
