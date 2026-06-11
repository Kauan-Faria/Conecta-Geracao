import { NotificationSentEvent } from '../../domain/value-objects/notification-sent-event.vo';

export const NOTIFICATION_ANALYTICS_PORT = Symbol('NOTIFICATION_ANALYTICS_PORT');

export interface NotificationAnalyticsPort {
  trackNotificationSent(event: NotificationSentEvent): Promise<void>;
}
