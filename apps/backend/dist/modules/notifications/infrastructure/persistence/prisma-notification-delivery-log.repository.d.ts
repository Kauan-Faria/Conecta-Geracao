import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { NotificationDeliveryLogRepository } from '../../application/ports/notification-delivery-log.repository';
import { NotificationDeliveryLog } from '../../domain/entities/notification-delivery-log.entity';
import { NotificationTypeValue } from '../../domain/value-objects/notification-type.vo';
export declare class PrismaNotificationDeliveryLogRepository implements NotificationDeliveryLogRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    save(log: NotificationDeliveryLog): Promise<NotificationDeliveryLog>;
    findLastSentReminder(conversationId: string): Promise<NotificationDeliveryLog | null>;
    existsSentWithin(conversationId: string, type: NotificationTypeValue, hours: number): Promise<boolean>;
    existsUserSentWithin(firebaseUid: string, type: NotificationTypeValue, days: number): Promise<boolean>;
}
