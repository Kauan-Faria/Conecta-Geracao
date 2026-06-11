import { NotificationDeliveryLogRepository } from '../../application/ports/notification-delivery-log.repository';
export declare class TipWeeklyRateLimitPolicy {
    private readonly deliveryLogs;
    constructor(deliveryLogs: NotificationDeliveryLogRepository);
    canSendTip(firebaseUid: string): Promise<boolean>;
}
