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

export function toDeviceTokenDto(token: DeviceToken): DeviceTokenDto {
  if (!token.id) {
    throw new Error('DeviceToken sem id não pode ser mapeado para DTO.');
  }
  return {
    id: token.id,
    platform: token.platform.value,
    isActive: token.isActive,
    lastSeenAt: token.lastSeenAt.toISOString(),
    createdAt: token.createdAt.toISOString(),
  };
}

export function toNotificationPreferenceDto(
  preference: NotificationPreference,
): NotificationPreferenceDto {
  return {
    enabled: preference.enabled,
    updatedAt: preference.updatedAt.toISOString(),
  };
}
