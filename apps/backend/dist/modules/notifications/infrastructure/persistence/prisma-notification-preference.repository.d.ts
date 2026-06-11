import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { NotificationPreferenceRepository } from '../../application/ports/notification-preference.repository';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
export declare class PrismaNotificationPreferenceRepository implements NotificationPreferenceRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByFirebaseUid(firebaseUid: string): Promise<NotificationPreference | null>;
    upsert(preference: NotificationPreference): Promise<NotificationPreference>;
    getOrCreateDefault(firebaseUid: string): Promise<NotificationPreference>;
    private toDomain;
}
