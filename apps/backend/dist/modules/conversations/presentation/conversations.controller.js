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
exports.ConversationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const firebase_auth_guard_1 = require("../../../shared/auth/firebase-auth.guard");
const current_user_decorator_1 = require("../../../shared/auth/current-user.decorator");
const paginated_response_1 = require("../../../shared/http/paginated-response");
const create_conversation_use_case_1 = require("../application/use-cases/create-conversation.use-case");
const list_conversations_use_case_1 = require("../application/use-cases/list-conversations.use-case");
const get_conversation_use_case_1 = require("../application/use-cases/get-conversation.use-case");
const send_message_use_case_1 = require("../application/use-cases/send-message.use-case");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
const list_conversations_query_dto_1 = require("./dto/list-conversations.query.dto");
const conversation_mapper_1 = require("./mappers/conversation.mapper");
let ConversationsController = class ConversationsController {
    constructor(createConversation, listConversations, getConversation, sendMessage) {
        this.createConversation = createConversation;
        this.listConversations = listConversations;
        this.getConversation = getConversation;
        this.sendMessage = sendMessage;
    }
    async create(user, dto) {
        const result = await this.createConversation.execute(user.uid, dto.topicSlug);
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, conversation_mapper_1.toConversationSummary)(result.value);
    }
    async list(user, query) {
        const result = await this.listConversations.execute(user.uid, {
            page: query.page,
            limit: query.limit,
        });
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, paginated_response_1.paginated)(result.value.items.map(conversation_mapper_1.toConversationSummary), query.page, query.limit, result.value.total);
    }
    async getById(user, id) {
        const result = await this.getConversation.execute(user.uid, id);
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, conversation_mapper_1.toConversationDetail)(result.value);
    }
    async postMessage(user, id, dto) {
        const result = await this.sendMessage.execute(user.uid, id, dto.content);
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, conversation_mapper_1.toMessageDto)(result.value);
    }
    mapDomainError(error) {
        switch (error.code) {
            case 'CONVERSATION_NOT_FOUND':
                throw new common_1.NotFoundException({
                    error: { code: 'NOT_FOUND', message: error.message },
                });
            case 'CONVERSATION_CLOSED':
                throw new common_1.ConflictException({
                    error: { code: 'CONVERSATION_CLOSED', message: error.message },
                });
            case 'INVALID_MESSAGE_CONTENT':
            case 'INVALID_TOPIC_SLUG':
                throw new common_1.BadRequestException({
                    error: { code: 'VALIDATION_ERROR', message: error.message },
                });
            default:
                throw new common_1.BadRequestException({
                    error: { code: 'VALIDATION_ERROR', message: error.message },
                });
        }
    }
};
exports.ConversationsController = ConversationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar nova conversa' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar conversas do usuário' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_conversations_query_dto_1.ListConversationsQueryDto]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter conversa com mensagens' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, common_1.HttpCode)(200),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar mensagem e receber resposta stub do assistente' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "postMessage", null);
exports.ConversationsController = ConversationsController = __decorate([
    (0, swagger_1.ApiTags)('conversations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.Controller)('conversations'),
    __metadata("design:paramtypes", [create_conversation_use_case_1.CreateConversationUseCase,
        list_conversations_use_case_1.ListConversationsUseCase,
        get_conversation_use_case_1.GetConversationUseCase,
        send_message_use_case_1.SendMessageUseCase])
], ConversationsController);
//# sourceMappingURL=conversations.controller.js.map