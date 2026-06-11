import { NotificationAnalyticsPort } from '../../application/ports/notification-analytics.port';
import { NotificationSentEvent } from '../../domain/value-objects/notification-sent-event.vo';
export declare class PinoNotificationAnalyticsAdapter implements NotificationAnalyticsPort {
    private readonly logger;
    trackNotificationSent(event: NotificationSentEvent): Promise<void>;
}
