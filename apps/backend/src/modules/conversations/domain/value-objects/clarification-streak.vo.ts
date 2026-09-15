/** Máximo de esclarecimentos seguidos antes do modo general (FR-3). */
export const MAX_CLARIFY_ATTEMPTS = 2;

export class ClarificationStreak {
  constructor(readonly count: number) {}

  get isExhausted(): boolean {
    return this.count >= MAX_CLARIFY_ATTEMPTS;
  }

  get isActive(): boolean {
    return this.count > 0 && !this.isExhausted;
  }
}
