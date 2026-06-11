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
exports.PrismaAbandonedConversationQuery = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../shared/prisma/prisma.service");
let PrismaAbandonedConversationQuery = class PrismaAbandonedConversationQuery {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAbandoned(thresholdHours, limit) {
        const threshold = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);
        const conversations = await this.prisma.conversation.findMany({
            where: {
                status: client_1.ConversationStatus.in_progress,
                messages: { some: {} },
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            take: limit,
            orderBy: { updatedAt: 'asc' },
        });
        return conversations
            .filter((conversation) => {
            const lastMessage = conversation.messages[0];
            return lastMessage && lastMessage.createdAt < threshold;
        })
            .map((conversation) => ({
            conversationId: conversation.id,
            firebaseUid: conversation.firebaseUid,
            lastActivityAt: conversation.messages[0].createdAt,
            status: conversation.status,
        }));
    }
};
exports.PrismaAbandonedConversationQuery = PrismaAbandonedConversationQuery;
exports.PrismaAbandonedConversationQuery = PrismaAbandonedConversationQuery = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAbandonedConversationQuery);
//# sourceMappingURL=prisma-abandoned-conversation.query.js.map