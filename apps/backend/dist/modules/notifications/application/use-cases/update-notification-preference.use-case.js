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
var UpdateNotificationPreferenceUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNotificationPreferenceUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const notification_preference_entity_1 = require("../../domain/entities/notification-preference.entity");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const firebase_uid_vo_1 = require("../../domain/value-objects/firebase-uid.vo");
const notification_preference_repository_1 = require("../ports/notification-preference.repository");
let UpdateNotificationPreferenceUseCase = UpdateNotificationPreferenceUseCase_1 = class UpdateNotificationPreferenceUseCase {
    constructor(preferences) {
        this.preferences = preferences;
        this.logger = new common_1.Logger(UpdateNotificationPreferenceUseCase_1.name);
    }
    async execute(firebaseUid, enabled) {
        try {
            firebase_uid_vo_1.FirebaseUid.create(firebaseUid);
            const existing = await this.preferences.findByFirebaseUid(firebaseUid);
            const base = existing ?? notification_preference_entity_1.NotificationPreference.createDefault(firebaseUid);
            const updated = base.updateEnabled(enabled);
            const saved = await this.preferences.upsert(updated);
            this.logger.log({
                event: 'NotificationPreferenceUpdated',
                firebaseUid,
                enabled,
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
exports.UpdateNotificationPreferenceUseCase = UpdateNotificationPreferenceUseCase;
exports.UpdateNotificationPreferenceUseCase = UpdateNotificationPreferenceUseCase = UpdateNotificationPreferenceUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(notification_preference_repository_1.NOTIFICATION_PREFERENCE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateNotificationPreferenceUseCase);
//# sourceMappingURL=update-notification-preference.use-case.js.map