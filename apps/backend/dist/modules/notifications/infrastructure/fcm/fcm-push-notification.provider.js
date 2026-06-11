"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FcmPushNotificationProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FcmPushNotificationProvider = void 0;
const common_1 = require("@nestjs/common");
const messaging_1 = require("firebase-admin/messaging");
const firebase_admin_provider_1 = require("../../../../shared/auth/firebase-admin.provider");
const device_token_repository_1 = require("../../application/ports/device-token.repository");
const push_notification_provider_1 = require("../../application/ports/push-notification.provider");
const fcm_constants_1 = require("./fcm.constants");
let FcmPushNotificationProvider = FcmPushNotificationProvider_1 = class FcmPushNotificationProvider {
    constructor(firebaseApp, deviceTokens) {
        this.firebaseApp = firebaseApp;
        this.deviceTokens = deviceTokens;
        this.logger = new common_1.Logger(FcmPushNotificationProvider_1.name);
    }
    async send(firebaseUid, notification) {
        const tokens = await this.deviceTokens.findActiveByFirebaseUid(firebaseUid);
        if (tokens.length === 0) {
            return push_notification_provider_1.SendResults.skipped('no_active_tokens');
        }
        const messaging = (0, messaging_1.getMessaging)(this.firebaseApp);
        const messageIds = [];
        let failures = 0;
        for (const deviceToken of tokens) {
            if (!deviceToken.id) {
                continue;
            }
            const payload = {
                token: deviceToken.token.value,
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                data: {
                    type: notification.type.value,
                    route: notification.deepLink,
                    ...(notification.conversationId
                        ? { conversationId: notification.conversationId }
                        : {}),
                },
            };
            try {
                const messageId = await this.sendWithRetry(messaging, payload);
                messageIds.push(messageId);
            }
            catch (error) {
                failures += 1;
                const code = this.extractErrorCode(error);
                this.logger.warn({
                    event: 'FcmSendFailed',
                    firebaseUid,
                    deviceTokenId: deviceToken.id,
                    token: (0, fcm_constants_1.truncateToken)(deviceToken.token.value),
                    code,
                });
                if (code && fcm_constants_1.FCM_PERMANENT_ERROR_CODES.has(code) && deviceToken.id) {
                    await this.deviceTokens.deactivateById(deviceToken.id);
                    this.logger.log({
                        event: 'DeviceTokenDeactivatedByFcm',
                        firebaseUid,
                        deviceTokenId: deviceToken.id,
                        fcmErrorCode: code,
                    });
                }
            }
        }
        if (messageIds.length === 0) {
            return push_notification_provider_1.SendResults.failed('FCM send failed for all tokens');
        }
        if (failures > 0) {
            return push_notification_provider_1.SendResults.partial(messageIds, `${failures} token(s) failed`);
        }
        return push_notification_provider_1.SendResults.sent(messageIds);
    }
    async sendWithRetry(messaging, payload) {
        let lastError;
        for (let attempt = 0; attempt <= fcm_constants_1.FCM_RETRY_DELAYS_MS.length; attempt += 1) {
            try {
                return await messaging.send(payload);
            }
            catch (error) {
                lastError = error;
                const code = this.extractErrorCode(error);
                if (!code || !fcm_constants_1.FCM_RETRYABLE_ERROR_CODES.has(code) || attempt === fcm_constants_1.FCM_RETRY_DELAYS_MS.length) {
                    throw error;
                }
                await (0, fcm_constants_1.sleep)(fcm_constants_1.FCM_RETRY_DELAYS_MS[attempt]);
            }
        }
        throw lastError;
    }
    extractErrorCode(error) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            return String(error.code);
        }
        return undefined;
    }
};
exports.FcmPushNotificationProvider = FcmPushNotificationProvider;
exports.FcmPushNotificationProvider = FcmPushNotificationProvider = FcmPushNotificationProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(firebase_admin_provider_1.FIREBASE_ADMIN)),
    __param(1, (0, common_1.Inject)(device_token_repository_1.DEVICE_TOKEN_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], FcmPushNotificationProvider);
//# sourceMappingURL=fcm-push-notification.provider.js.map