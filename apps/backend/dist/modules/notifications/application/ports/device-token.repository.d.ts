import { DeviceToken } from '../../domain/entities/device-token.entity';
export declare const DEVICE_TOKEN_REPOSITORY: unique symbol;
export interface DeviceTokenRepository {
    upsert(token: DeviceToken): Promise<DeviceToken>;
    findActiveByFirebaseUid(firebaseUid: string): Promise<DeviceToken[]>;
    deactivateByFirebaseUidAndToken(firebaseUid: string, fcmToken: string): Promise<void>;
    deactivateById(id: string): Promise<void>;
}
