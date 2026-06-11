import { DeviceToken } from '../../domain/entities/device-token.entity';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
export interface DeviceTokenDto {
    id: string;
    platform: string;
    isActive: boolean;
    lastSeenAt: string;
    createdAt: string;
}
export interface NotificationPreferenceDto {
    enabled: boolean;
    updatedAt: string;
}
export declare function toDeviceTokenDto(token: DeviceToken): DeviceTokenDto;
export declare function toNotificationPreferenceDto(preference: NotificationPreference): NotificationPreferenceDto;
