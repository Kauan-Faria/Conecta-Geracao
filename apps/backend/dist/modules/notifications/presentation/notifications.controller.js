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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const firebase_auth_guard_1 = require("../../../shared/auth/firebase-auth.guard");
const current_user_decorator_1 = require("../../../shared/auth/current-user.decorator");
const register_device_token_use_case_1 = require("../application/use-cases/register-device-token.use-case");
const update_notification_preference_use_case_1 = require("../application/use-cases/update-notification-preference.use-case");
const deactivate_device_token_use_case_1 = require("../application/use-cases/deactivate-device-token.use-case");
const get_notification_preference_use_case_1 = require("../application/use-cases/get-notification-preference.use-case");
const register_device_token_dto_1 = require("./dto/register-device-token.dto");
const update_notification_preference_dto_1 = require("./dto/update-notification-preference.dto");
const deactivate_device_token_dto_1 = require("./dto/deactivate-device-token.dto");
const notifications_mapper_1 = require("./mappers/notifications.mapper");
let NotificationsController = class NotificationsController {
    constructor(registerDeviceToken, updateNotificationPreference, deactivateDeviceToken, getNotificationPreference) {
        this.registerDeviceToken = registerDeviceToken;
        this.updateNotificationPreference = updateNotificationPreference;
        this.deactivateDeviceToken = deactivateDeviceToken;
        this.getNotificationPreference = getNotificationPreference;
    }
    async putDeviceToken(user, dto) {
        const result = await this.registerDeviceToken.execute(user.uid, dto.token, dto.platform);
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, notifications_mapper_1.toDeviceTokenDto)(result.value);
    }
    async deleteDeviceToken(user, dto) {
        const result = await this.deactivateDeviceToken.execute(user.uid, dto.token);
        if (!result.ok)
            throw this.mapDomainError(result.error);
    }
    async getPreferences(user) {
        const result = await this.getNotificationPreference.execute(user.uid);
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, notifications_mapper_1.toNotificationPreferenceDto)(result.value);
    }
    async putPreferences(user, dto) {
        const result = await this.updateNotificationPreference.execute(user.uid, dto.enabled);
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, notifications_mapper_1.toNotificationPreferenceDto)(result.value);
    }
    mapDomainError(error) {
        throw new common_1.BadRequestException({
            error: { code: 'VALIDATION_ERROR', message: error.message },
        });
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Put)('device-token'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar ou atualizar token FCM do dispositivo' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, register_device_token_dto_1.RegisterDeviceTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "putDeviceToken", null);
__decorate([
    (0, common_1.Delete)('device-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Inativar token FCM no logout' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, deactivate_device_token_dto_1.DeactivateDeviceTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteDeviceToken", null);
__decorate([
    (0, common_1.Get)('preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter preferência de notificações do usuário' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Put)('preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar preferência de notificações' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_notification_preference_dto_1.UpdateNotificationPreferenceDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "putPreferences", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [register_device_token_use_case_1.RegisterDeviceTokenUseCase,
        update_notification_preference_use_case_1.UpdateNotificationPreferenceUseCase,
        deactivate_device_token_use_case_1.DeactivateDeviceTokenUseCase,
        get_notification_preference_use_case_1.GetNotificationPreferenceUseCase])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map