import { NotificationSentEvent } from '../../domain/value-objects/notification-sent-event.vo';
export declare const NOTIFICATION_ANALYTICS_PORT: unique symbol;
export interface NotificationAnalyticsPort {
    trackNotificationSent(event: NotificationSentEvent): Promise<void>;
}
