import { PushNotification } from '../../domain/value-objects/push-notification.vo';

export type SendResultStatus = 'sent' | 'skipped' | 'partial' | 'failed';

export type SkippedReason =
  | 'preference_disabled'
  | 'no_active_tokens'
  | 'cooldown_active'
  | 'conversation_closed'
  | 'unsafe_payload'
  | 'fcm_disabled'
  | 'app_in_foreground';

export interface SendResult {
  status: SendResultStatus;
  messageIds?: string[];
  skippedReason?: SkippedReason;
  error?: string;
}

export const SendResults = {
  sent(messageIds: string[]): SendResult {
    return { status: 'sent', messageIds };
  },
  skipped(reason: SkippedReason): SendResult {
    return { status: 'skipped', skippedReason: reason };
  },
  partial(messageIds: string[], error?: string): SendResult {
    return { status: 'partial', messageIds, error };
  },
  failed(error: string): SendResult {
    return { status: 'failed', error };
  },
};

export const PUSH_NOTIFICATION_PROVIDER = Symbol('PUSH_NOTIFICATION_PROVIDER');

export interface PushNotificationProvider {
  send(firebaseUid: string, notification: PushNotification): Promise<SendResult>;
}
