"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDeviceTokenDto = toDeviceTokenDto;
exports.toNotificationPreferenceDto = toNotificationPreferenceDto;
function toDeviceTokenDto(token) {
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
function toNotificationPreferenceDto(preference) {
    return {
        enabled: preference.enabled,
        updatedAt: preference.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=notifications.mapper.js.map