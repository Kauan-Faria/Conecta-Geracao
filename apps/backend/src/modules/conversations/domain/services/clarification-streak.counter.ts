import { ClarificationStreak } from '../value-objects/clarification-streak.vo';
import { ReplyMode } from '../value-objects/reply-mode.vo';

export interface StreakHistoryTurn {
  role: 'user' | 'assistant';
  replyMode?: ReplyMode;
}

export class ClarificationStreakCounter {
  count(history: StreakHistoryTurn[]): ClarificationStreak {
    let consecutive = 0;

    for (let index = history.length - 1; index >= 0; index -= 1) {
      const turn = history[index];
      if (turn.role === 'user') {
        continue;
      }
      if (turn.replyMode === 'clarify') {
        consecutive += 1;
        continue;
      }
      break;
    }

    return new ClarificationStreak(consecutive);
  }
}
