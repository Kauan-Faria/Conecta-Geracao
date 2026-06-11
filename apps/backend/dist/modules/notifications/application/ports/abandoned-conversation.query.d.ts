export type ConversationActivityStatus = 'in_progress' | 'completed';
export interface AbandonedConversationSnapshot {
    conversationId: string;
    firebaseUid: string;
    lastActivityAt: Date;
    status: ConversationActivityStatus;
}
export declare const ABANDONED_CONVERSATION_QUERY: unique symbol;
export interface AbandonedConversationQuery {
    findAbandoned(thresholdHours: number, limit: number): Promise<AbandonedConversationSnapshot[]>;
}
