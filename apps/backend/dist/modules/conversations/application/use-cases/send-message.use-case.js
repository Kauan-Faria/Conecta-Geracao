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
exports.SendMessageUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const message_content_vo_1 = require("../../domain/value-objects/message-content.vo");
const assistant_reply_generator_1 = require("../ports/assistant-reply.generator");
const message_repository_1 = require("../ports/message.repository");
const conversation_repository_1 = require("../ports/conversation.repository");
const conversation_ownership_policy_1 = require("../../domain/services/conversation-ownership.policy");
let SendMessageUseCase = class SendMessageUseCase {
    constructor(conversations, unitOfWork, replyGenerator, messages, ownership) {
        this.conversations = conversations;
        this.unitOfWork = unitOfWork;
        this.replyGenerator = replyGenerator;
        this.messages = messages;
        this.ownership = ownership;
    }
    async execute(firebaseUid, conversationId, rawContent) {
        try {
            const conversation = await this.conversations.findByIdForUser(conversationId, firebaseUid);
            const owned = this.ownership.assertOwner(conversation, firebaseUid);
            owned.assertCanReceiveMessage();
            const userContent = message_content_vo_1.MessageContent.create(rawContent);
            const history = await this.messages.listByConversationId(conversationId);
            const messageHistory = history.slice(-10).map((m) => ({
                role: m.role.value,
                content: m.content.value,
            }));
            const assistantReply = await this.replyGenerator.generateReply({
                conversationId,
                userMessage: userContent.value,
                topicSlug: owned.topicSlug,
                currentStep: owned.currentStep,
                messageHistory,
            });
            const result = await this.unitOfWork.sendMessage({
                conversationId,
                firebaseUid,
                userContent: userContent.value,
                assistantContent: assistantReply.content.value,
                nextCurrentStep: assistantReply.nextCurrentStep,
                topicSlug: assistantReply.resolvedTopicSlug ?? owned.topicSlug,
            });
            return (0, result_1.ok)(result.assistantMessage);
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                return (0, result_1.err)(error);
            }
            throw error;
        }
    }
};
exports.SendMessageUseCase = SendMessageUseCase;
exports.SendMessageUseCase = SendMessageUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(conversation_repository_1.CONVERSATION_REPOSITORY)),
    __param(1, (0, common_1.Inject)(message_repository_1.CONVERSATION_MESSAGE_UOW)),
    __param(2, (0, common_1.Inject)(assistant_reply_generator_1.ASSISTANT_REPLY_GENERATOR)),
    __param(3, (0, common_1.Inject)(message_repository_1.MESSAGE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, conversation_ownership_policy_1.ConversationOwnershipPolicy])
], SendMessageUseCase);
//# sourceMappingURL=send-message.use-case.js.map