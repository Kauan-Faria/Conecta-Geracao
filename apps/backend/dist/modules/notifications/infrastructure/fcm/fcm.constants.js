"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCM_RETRY_DELAYS_MS = exports.FCM_RETRYABLE_ERROR_CODES = exports.FCM_PERMANENT_ERROR_CODES = void 0;
exports.truncateToken = truncateToken;
exports.sleep = sleep;
exports.FCM_PERMANENT_ERROR_CODES = new Set([
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
    'messaging/invalid-argument',
]);
exports.FCM_RETRYABLE_ERROR_CODES = new Set([
    'messaging/internal-error',
    'messaging/server-unavailable',
    'messaging/quota-exceeded',
    'messaging/unknown-error',
]);
exports.FCM_RETRY_DELAYS_MS = [1000, 2000, 4000];
function truncateToken(token) {
    if (token.length <= 8)
        return '***';
    return `${token.slice(0, 8)}...`;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=fcm.constants.js.map