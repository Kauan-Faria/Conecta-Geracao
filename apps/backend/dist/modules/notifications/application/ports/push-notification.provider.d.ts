import { PushNotification } from '../../domain/value-objects/push-notification.vo';
export type SendResultStatus = 'sent' | 'skipped' | 'partial' | 'failed';
export type SkippedReason = 'preference_disabled' | 'no_active_tokens' | 'cooldown_active' | 'conversation_closed' | 'unsafe_payload' | 'fcm_disabled' | 'app_in_foreground';
export interface SendResult {
    status: SendResultStatus;
    messageIds?: string[];
    skippedReason?: SkippedReason;
    error?: string;
}
export declare const SendResults: {
    sent(messageIds: string[]): SendResult;
    skipped(reason: SkippedReason): SendResult;
    partial(messageIds: string[], error?: string): SendResult;
    failed(error: string): SendResult;
};
export declare const PUSH_NOTIFICATION_PROVIDER: unique symbol;
export interface PushNotificationProvider {
    send(firebaseUid: string, notification: PushNotification): Promise<SendResult>;
}
