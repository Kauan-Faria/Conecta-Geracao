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
var RegisterDeviceTokenUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDeviceTokenUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const device_token_entity_1 = require("../../domain/entities/device-token.entity");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const device_token_repository_1 = require("../ports/device-token.repository");
const notification_preference_repository_1 = require("../ports/notification-preference.repository");
let RegisterDeviceTokenUseCase = RegisterDeviceTokenUseCase_1 = class RegisterDeviceTokenUseCase {
    constructor(deviceTokens, preferences) {
        this.deviceTokens = deviceTokens;
        this.preferences = preferences;
        this.logger = new common_1.Logger(RegisterDeviceTokenUseCase_1.name);
    }
    async execute(firebaseUid, token, platform) {
        try {
            const deviceToken = device_token_entity_1.DeviceToken.register({ firebaseUid, token, platform });
            const saved = await this.deviceTokens.upsert(deviceToken);
            await this.preferences.getOrCreateDefault(firebaseUid);
            this.logger.log({
                event: 'DeviceTokenRegistered',
                firebaseUid,
                deviceTokenId: saved.id,
                platform: saved.platform.value,
            });
            return (0, result_1.ok)(saved);
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                return (0, result_1.err)(error);
            }
            throw error;
        }
    }
};
exports.RegisterDeviceTokenUseCase = RegisterDeviceTokenUseCase;
exports.RegisterDeviceTokenUseCase = RegisterDeviceTokenUseCase = RegisterDeviceTokenUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(device_token_repository_1.DEVICE_TOKEN_REPOSITORY)),
    __param(1, (0, common_1.Inject)(notification_preference_repository_1.NOTIFICATION_PREFERENCE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], RegisterDeviceTokenUseCase);
//# sourceMappingURL=register-device-token.use-case.js.map