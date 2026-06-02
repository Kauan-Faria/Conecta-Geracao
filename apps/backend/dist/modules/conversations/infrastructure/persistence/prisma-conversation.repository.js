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
exports.PrismaConversationMessageUnitOfWork = exports.PrismaMessageRepository = exports.PrismaConversationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/prisma/prisma.service");
const conversation_entity_1 = require("../../domain/entities/conversation.entity");
const conversation_status_vo_1 = require("../../domain/value-objects/conversation-status.vo");
const message_content_vo_1 = require("../../domain/value-objects/message-content.vo");
const message_role_vo_1 = require("../../domain/value-objects/message-role.vo");
let PrismaConversationRepository = class PrismaConversationRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(conversation) {
        const row = await this.prisma.conversation.create({
            data: {
                firebaseUid: conversation.firebaseUid,
                topicSlug: conversation.topicSlug,
                status: conversation.status.value,
                currentStep: conversation.currentStep,
            },
        });
        return this.toDomain(row);
    }
    async findByIdForUser(id, firebaseUid) {
        const row = await this.prisma.conversation.findFirst({
            where: { id, firebaseUid },
        });
        if (!row)
            return null;
        return this.toDomain(row);
    }
    async listByUser(firebaseUid, pagination) {
        const skip = (pagination.page - 1) * pagination.limit;
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.conversation.findMany({
                where: { firebaseUid },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: pagination.limit,
            }),
            this.prisma.conversation.count({ where: { firebaseUid } }),
        ]);
        return {
            items: rows.map((row) => this.toDomain(row)),
            total,
        };
    }
    toDomain(row) {
        return conversation_entity_1.Conversation.create({
            id: row.id,
            firebaseUid: row.firebaseUid,
            topicSlug: row.topicSlug,
            status: conversation_status_vo_1.ConversationStatus.from(row.status),
            currentStep: row.currentStep,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
};
exports.PrismaConversationRepository = PrismaConversationRepository;
exports.PrismaConversationRepository = PrismaConversationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaConversationRepository);
let PrismaMessageRepository = class PrismaMessageRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listByConversationId(conversationId) {
        const rows = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
        return rows.map((row) => this.toDomain(row));
    }
    toDomain(row) {
        return conversation_entity_1.Message.create({
            id: row.id,
            conversationId: row.conversationId,
            role: message_role_vo_1.MessageRole.from(row.role),
            content: message_content_vo_1.MessageContent.create(row.content),
            createdAt: row.createdAt,
        });
    }
};
exports.PrismaMessageRepository = PrismaMessageRepository;
exports.PrismaMessageRepository = PrismaMessageRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaMessageRepository);
let PrismaConversationMessageUnitOfWork = class PrismaConversationMessageUnitOfWork {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendMessage(input) {
        return this.prisma.$transaction(async (tx) => {
            const conversation = await tx.conversation.findFirst({
                where: { id: input.conversationId, firebaseUid: input.firebaseUid },
            });
            if (!conversation) {
                throw new Error('Conversa não encontrada na transação.');
            }
            if (conversation.status !== 'in_progress') {
                throw new Error('Conversa encerrada na transação.');
            }
            await tx.message.create({
                data: {
                    conversationId: input.conversationId,
                    role: 'user',
                    content: input.userContent,
                },
            });
            const assistantRow = await tx.message.create({
                data: {
                    conversationId: input.conversationId,
                    role: 'assistant',
                    content: input.assistantContent,
                },
            });
            await tx.conversation.update({
                where: { id: input.conversationId },
                data: {
                    updatedAt: new Date(),
                    currentStep: input.nextCurrentStep,
                    ...(input.topicSlug && !conversation.topicSlug
                        ? { topicSlug: input.topicSlug }
                        : {}),
                },
            });
            return {
                assistantMessage: conversation_entity_1.Message.create({
                    id: assistantRow.id,
                    conversationId: assistantRow.conversationId,
                    role: message_role_vo_1.MessageRole.assistant(),
                    content: message_content_vo_1.MessageContent.create(assistantRow.content),
                    createdAt: assistantRow.createdAt,
                }),
            };
        });
    }
};
exports.PrismaConversationMessageUnitOfWork = PrismaConversationMessageUnitOfWork;
exports.PrismaConversationMessageUnitOfWork = PrismaConversationMessageUnitOfWork = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaConversationMessageUnitOfWork);
//# sourceMappingURL=prisma-conversation.repository.js.map