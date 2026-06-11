export type ConversationActivityStatus = 'in_progress' | 'completed';

export interface AbandonedConversationSnapshot {
  conversationId: string;
  firebaseUid: string;
  lastActivityAt: Date;
  status: ConversationActivityStatus;
}

export const ABANDONED_CONVERSATION_QUERY = Symbol('ABANDONED_CONVERSATION_QUERY');

export interface AbandonedConversationQuery {
  findAbandoned(thresholdHours: number, limit: number): Promise<AbandonedConversationSnapshot[]>;
}
