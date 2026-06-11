"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NoOpPushNotificationProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoOpPushNotificationProvider = void 0;
const common_1 = require("@nestjs/common");
const push_notification_provider_1 = require("../../application/ports/push-notification.provider");
let NoOpPushNotificationProvider = NoOpPushNotificationProvider_1 = class NoOpPushNotificationProvider {
    constructor() {
        this.logger = new common_1.Logger(NoOpPushNotificationProvider_1.name);
    }
    async send(firebaseUid, notification) {
        this.logger.debug({
            event: 'FcmNoOpSkipped',
            firebaseUid,
            notificationType: notification.type.value,
            conversationId: notification.conversationId,
        });
        return push_notification_provider_1.SendResults.skipped('fcm_disabled');
    }
};
exports.NoOpPushNotificationProvider = NoOpPushNotificationProvider;
exports.NoOpPushNotificationProvider = NoOpPushNotificationProvider = NoOpPushNotificationProvider_1 = __decorate([
    (0, common_1.Injectable)()
], NoOpPushNotificationProvider);
//# sourceMappingURL=no-op-push-notification.provider.js.map