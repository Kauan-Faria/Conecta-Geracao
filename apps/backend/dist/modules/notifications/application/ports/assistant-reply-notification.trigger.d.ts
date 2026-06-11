export interface AssistantReplyReadyEvent {
    conversationId: string;
    firebaseUid: string;
    appInBackground: boolean;
}
export declare const ASSISTANT_REPLY_NOTIFICATION_TRIGGER: unique symbol;
export interface AssistantReplyNotificationTrigger {
    onAssistantReplyReady(event: AssistantReplyReadyEvent): Promise<void>;
}
