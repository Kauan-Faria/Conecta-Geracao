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
exports.PrismaNotificationDeliveryLogRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/prisma/prisma.service");
const notification_delivery_log_entity_1 = require("../../domain/entities/notification-delivery-log.entity");
let PrismaNotificationDeliveryLogRepository = class PrismaNotificationDeliveryLogRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(log) {
        const row = await this.prisma.notificationDeliveryLog.create({
            data: {
                firebaseUid: log.firebaseUid,
                conversationId: log.conversationId,
                notificationType: log.notificationType,
                status: log.status,
                fcmMessageId: log.fcmMessageId,
                skippedReason: log.skippedReason,
                sentAt: log.sentAt,
            },
        });
        return notification_delivery_log_entity_1.NotificationDeliveryLog.reconstitute({
            id: row.id,
            firebaseUid: row.firebaseUid,
            conversationId: row.conversationId,
            notificationType: row.notificationType,
            status: row.status,
            fcmMessageId: row.fcmMessageId,
            skippedReason: row.skippedReason,
            sentAt: row.sentAt,
        });
    }
    async findLastSentReminder(conversationId) {
        const row = await this.prisma.notificationDeliveryLog.findFirst({
            where: {
                conversationId,
                notificationType: 'reminder',
                status: 'sent',
            },
            orderBy: { sentAt: 'desc' },
        });
        if (!row)
            return null;
        return notification_delivery_log_entity_1.NotificationDeliveryLog.reconstitute({
            id: row.id,
            firebaseUid: row.firebaseUid,
            conversationId: row.conversationId,
            notificationType: row.notificationType,
            status: row.status,
            fcmMessageId: row.fcmMessageId,
            skippedReason: row.skippedReason,
            sentAt: row.sentAt,
        });
    }
    async existsSentWithin(conversationId, type, hours) {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        const row = await this.prisma.notificationDeliveryLog.findFirst({
            where: {
                conversationId,
                notificationType: type,
                status: 'sent',
                sentAt: { gte: since },
            },
            select: { id: true },
        });
        return row !== null;
    }
    async existsUserSentWithin(firebaseUid, type, days) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const row = await this.prisma.notificationDeliveryLog.findFirst({
            where: {
                firebaseUid,
                notificationType: type,
                status: 'sent',
                sentAt: { gte: since },
            },
            select: { id: true },
        });
        return row !== null;
    }
};
exports.PrismaNotificationDeliveryLogRepository = PrismaNotificationDeliveryLogRepository;
exports.PrismaNotificationDeliveryLogRepository = PrismaNotificationDeliveryLogRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaNotificationDeliveryLogRepository);
//# sourceMappingURL=prisma-notification-delivery-log.repository.js.map