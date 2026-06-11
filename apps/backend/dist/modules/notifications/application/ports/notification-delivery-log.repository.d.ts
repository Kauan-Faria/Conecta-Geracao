import { NotificationDeliveryLog } from '../../domain/entities/notification-delivery-log.entity';
import { NotificationTypeValue } from '../../domain/value-objects/notification-type.vo';
export declare const NOTIFICATION_DELIVERY_LOG_REPOSITORY: unique symbol;
export interface NotificationDeliveryLogRepository {
    save(log: NotificationDeliveryLog): Promise<NotificationDeliveryLog>;
    findLastSentReminder(conversationId: string): Promise<NotificationDeliveryLog | null>;
    existsSentWithin(conversationId: string, type: NotificationTypeValue, hours: number): Promise<boolean>;
    existsUserSentWithin(firebaseUid: string, type: NotificationTypeValue, days: number): Promise<boolean>;
}
