"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignBatchLimitExceededError = exports.DynamicContentNotAllowedError = exports.InvalidCampaignSegmentError = exports.InvalidPushNotificationError = exports.InvalidFirebaseUidError = exports.InvalidDevicePlatformError = exports.InvalidFcmTokenError = exports.DomainError = void 0;
class DomainError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'DomainError';
    }
}
exports.DomainError = DomainError;
class InvalidFcmTokenError extends DomainError {
    constructor(message = 'Token FCM inválido.') {
        super('INVALID_FCM_TOKEN', message);
    }
}
exports.InvalidFcmTokenError = InvalidFcmTokenError;
class InvalidDevicePlatformError extends DomainError {
    constructor(platform) {
        super('INVALID_DEVICE_PLATFORM', `Plataforma inválida: ${platform}`);
    }
}
exports.InvalidDevicePlatformError = InvalidDevicePlatformError;
class InvalidFirebaseUidError extends DomainError {
    constructor(message = 'Identificador de usuário inválido.') {
        super('INVALID_FIREBASE_UID', message);
    }
}
exports.InvalidFirebaseUidError = InvalidFirebaseUidError;
class InvalidPushNotificationError extends DomainError {
    constructor(message) {
        super('INVALID_PUSH_NOTIFICATION', message);
    }
}
exports.InvalidPushNotificationError = InvalidPushNotificationError;
class InvalidCampaignSegmentError extends DomainError {
    constructor(message) {
        super('INVALID_CAMPAIGN_SEGMENT', message);
    }
}
exports.InvalidCampaignSegmentError = InvalidCampaignSegmentError;
class DynamicContentNotAllowedError extends DomainError {
    constructor(message = 'Conteúdo dinâmico não permitido para dicas educativas.') {
        super('DYNAMIC_CONTENT_NOT_ALLOWED', message);
    }
}
exports.DynamicContentNotAllowedError = DynamicContentNotAllowedError;
class CampaignBatchLimitExceededError extends DomainError {
    constructor(limit) {
        super('CAMPAIGN_BATCH_LIMIT_EXCEEDED', `Segmento excede o limite de ${limit} destinatários no MVP.`);
    }
}
exports.CampaignBatchLimitExceededError = CampaignBatchLimitExceededError;
//# sourceMappingURL=domain.errors.js.map