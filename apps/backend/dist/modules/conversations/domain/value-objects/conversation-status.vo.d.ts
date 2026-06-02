export type ConversationStatusValue = 'in_progress' | 'completed';
export declare class ConversationStatus {
    readonly value: ConversationStatusValue;
    private constructor();
    static inProgress(): ConversationStatus;
    static completed(): ConversationStatus;
    static from(value: ConversationStatusValue): ConversationStatus;
    isInProgress(): boolean;
}
