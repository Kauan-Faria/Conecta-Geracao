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
exports.GetNotificationPreferenceUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const firebase_uid_vo_1 = require("../../domain/value-objects/firebase-uid.vo");
const notification_preference_repository_1 = require("../ports/notification-preference.repository");
let GetNotificationPreferenceUseCase = class GetNotificationPreferenceUseCase {
    constructor(preferences) {
        this.preferences = preferences;
    }
    async execute(firebaseUid) {
        try {
            firebase_uid_vo_1.FirebaseUid.create(firebaseUid);
            const preference = await this.preferences.getOrCreateDefault(firebaseUid);
            return (0, result_1.ok)(preference);
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                return (0, result_1.err)(error);
            }
            throw error;
        }
    }
};
exports.GetNotificationPreferenceUseCase = GetNotificationPreferenceUseCase;
exports.GetNotificationPreferenceUseCase = GetNotificationPreferenceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(notification_preference_repository_1.NOTIFICATION_PREFERENCE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetNotificationPreferenceUseCase);
//# sourceMappingURL=get-notification-preference.use-case.js.map