import { NotificationDeliveryLogRepository } from '../../application/ports/notification-delivery-log.repository';
export declare class ReminderCooldownPolicy {
    private readonly deliveryLogs;
    constructor(deliveryLogs: NotificationDeliveryLogRepository);
    canSendReminder(conversationId: string): Promise<boolean>;
}
