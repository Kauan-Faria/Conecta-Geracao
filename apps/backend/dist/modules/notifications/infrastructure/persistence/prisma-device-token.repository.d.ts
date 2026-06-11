import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { DeviceTokenRepository } from '../../application/ports/device-token.repository';
import { DeviceToken } from '../../domain/entities/device-token.entity';
export declare class PrismaDeviceTokenRepository implements DeviceTokenRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsert(token: DeviceToken): Promise<DeviceToken>;
    findActiveByFirebaseUid(firebaseUid: string): Promise<DeviceToken[]>;
    deactivateByFirebaseUidAndToken(firebaseUid: string, fcmToken: string): Promise<void>;
    deactivateById(id: string): Promise<void>;
    private toDomain;
}
