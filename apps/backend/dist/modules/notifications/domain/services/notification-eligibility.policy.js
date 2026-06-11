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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEligibilityPolicy = void 0;
const common_1 = require("@nestjs/common");
const device_token_repository_1 = require("../../application/ports/device-token.repository");
const notification_preference_repository_1 = require("../../application/ports/notification-preference.repository");
let NotificationEligibilityPolicy = class NotificationEligibilityPolicy {
    constructor(preferences, deviceTokens) {
        this.preferences = preferences;
        this.deviceTokens = deviceTokens;
    }
    async canSend(firebaseUid) {
        const preference = await this.preferences.getOrCreateDefault(firebaseUid);
        if (!preference.enabled) {
            return { eligible: false, reason: 'preference_disabled' };
        }
        const tokens = await this.deviceTokens.findActiveByFirebaseUid(firebaseUid);
        if (tokens.length === 0) {
            return { eligible: false, reason: 'no_active_tokens' };
        }
        return { eligible: true };
    }
};
exports.NotificationEligibilityPolicy = NotificationEligibilityPolicy;
exports.NotificationEligibilityPolicy = NotificationEligibilityPolicy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(notification_preference_repository_1.NOTIFICATION_PREFERENCE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(device_token_repository_1.DEVICE_TOKEN_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], NotificationEligibilityPolicy);
//# sourceMappingURL=notification-eligibility.policy.js.map