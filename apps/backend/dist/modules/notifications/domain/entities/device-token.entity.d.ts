import { DevicePlatform } from '../value-objects/device-platform.vo';
import { FcmToken } from '../value-objects/fcm-token.vo';
export interface DeviceTokenProps {
    id?: string;
    firebaseUid: string;
    token: FcmToken;
    platform: DevicePlatform;
    isActive?: boolean;
    lastSeenAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class DeviceToken {
    readonly id?: string;
    readonly firebaseUid: string;
    readonly token: FcmToken;
    readonly platform: DevicePlatform;
    readonly isActive: boolean;
    readonly lastSeenAt: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    private constructor();
    static register(props: {
        firebaseUid: string;
        token: string;
        platform: string;
    }): DeviceToken;
    static reconstitute(props: DeviceTokenProps): DeviceToken;
    refreshLastSeen(): DeviceToken;
    deactivate(): DeviceToken;
}
