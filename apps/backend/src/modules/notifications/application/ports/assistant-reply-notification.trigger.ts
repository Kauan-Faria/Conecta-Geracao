export interface AssistantReplyReadyEvent {
  conversationId: string;
  firebaseUid: string;
  appInBackground: boolean;
}

export const ASSISTANT_REPLY_NOTIFICATION_TRIGGER = Symbol(
  'ASSISTANT_REPLY_NOTIFICATION_TRIGGER',
);

export interface AssistantReplyNotificationTrigger {
  onAssistantReplyReady(event: AssistantReplyReadyEvent): Promise<void>;
}
