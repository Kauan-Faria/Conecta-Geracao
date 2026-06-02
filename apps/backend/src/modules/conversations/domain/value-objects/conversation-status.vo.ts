export type ConversationStatusValue = 'in_progress' | 'completed';

export class ConversationStatus {
  private constructor(public readonly value: ConversationStatusValue) {}

  static inProgress(): ConversationStatus {
    return new ConversationStatus('in_progress');
  }

  static completed(): ConversationStatus {
    return new ConversationStatus('completed');
  }

  static from(value: ConversationStatusValue): ConversationStatus {
    return new ConversationStatus(value);
  }

  isInProgress(): boolean {
    return this.value === 'in_progress';
  }
}
