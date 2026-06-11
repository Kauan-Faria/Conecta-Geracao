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
exports.PrismaDeviceTokenRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/prisma/prisma.service");
const device_token_entity_1 = require("../../domain/entities/device-token.entity");
const device_platform_vo_1 = require("../../domain/value-objects/device-platform.vo");
const fcm_token_vo_1 = require("../../domain/value-objects/fcm-token.vo");
let PrismaDeviceTokenRepository = class PrismaDeviceTokenRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsert(token) {
        const row = await this.prisma.deviceToken.upsert({
            where: {
                firebaseUid_token: {
                    firebaseUid: token.firebaseUid,
                    token: token.token.value,
                },
            },
            create: {
                firebaseUid: token.firebaseUid,
                token: token.token.value,
                platform: token.platform.value,
                isActive: token.isActive,
                lastSeenAt: token.lastSeenAt,
            },
            update: {
                platform: token.platform.value,
                isActive: true,
                lastSeenAt: new Date(),
            },
        });
        return this.toDomain(row);
    }
    async findActiveByFirebaseUid(firebaseUid) {
        const rows = await this.prisma.deviceToken.findMany({
            where: { firebaseUid, isActive: true },
            orderBy: { lastSeenAt: 'desc' },
        });
        return rows.map((row) => this.toDomain(row));
    }
    async deactivateByFirebaseUidAndToken(firebaseUid, fcmToken) {
        await this.prisma.deviceToken.updateMany({
            where: { firebaseUid, token: fcmToken },
            data: { isActive: false },
        });
    }
    async deactivateById(id) {
        await this.prisma.deviceToken.update({
            where: { id },
            data: { isActive: false },
        });
    }
    toDomain(row) {
        return device_token_entity_1.DeviceToken.reconstitute({
            id: row.id,
            firebaseUid: row.firebaseUid,
            token: fcm_token_vo_1.FcmToken.create(row.token),
            platform: device_platform_vo_1.DevicePlatform.create(row.platform),
            isActive: row.isActive,
            lastSeenAt: row.lastSeenAt,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
};
exports.PrismaDeviceTokenRepository = PrismaDeviceTokenRepository;
exports.PrismaDeviceTokenRepository = PrismaDeviceTokenRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDeviceTokenRepository);
//# sourceMappingURL=prisma-device-token.repository.js.map