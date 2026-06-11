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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaNotificationPreferenceRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/prisma/prisma.service");
const notification_preference_entity_1 = require("../../domain/entities/notification-preference.entity");
let PrismaNotificationPreferenceRepository = class PrismaNotificationPreferenceRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByFirebaseUid(firebaseUid) {
        const row = await this.prisma.notificationPreference.findUnique({
            where: { firebaseUid },
        });
        if (!row)
            return null;
        return this.toDomain(row);
    }
    async upsert(preference) {
        const row = await this.prisma.notificationPreference.upsert({
            where: { firebaseUid: preference.firebaseUid },
            create: {
                firebaseUid: preference.firebaseUid,
                enabled: preference.enabled,
            },
            update: {
                enabled: preference.enabled,
            },
        });
        return this.toDomain(row);
    }
    async getOrCreateDefault(firebaseUid) {
        const existing = await this.findByFirebaseUid(firebaseUid);
        if (existing)
            return existing;
        return this.upsert(notification_preference_entity_1.NotificationPreference.createDefault(firebaseUid));
    }
    toDomain(row) {
        return notification_preference_entity_1.NotificationPreference.reconstitute({
            firebaseUid: row.firebaseUid,
            enabled: row.enabled,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
};
exports.PrismaNotificationPreferenceRepository = PrismaNotificationPreferenceRepository;
exports.PrismaNotificationPreferenceRepository = PrismaNotificationPreferenceRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaNotificationPreferenceRepository);
//# sourceMappingURL=prisma-notification-preference.repository.js.map