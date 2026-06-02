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
exports.GetConversationUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const conversation_ownership_policy_1 = require("../../domain/services/conversation-ownership.policy");
const conversation_repository_1 = require("../ports/conversation.repository");
const message_repository_1 = require("../ports/message.repository");
let GetConversationUseCase = class GetConversationUseCase {
    constructor(conversations, messages, ownership) {
        this.conversations = conversations;
        this.messages = messages;
        this.ownership = ownership;
    }
    async execute(firebaseUid, conversationId) {
        try {
            const conversation = await this.conversations.findByIdForUser(conversationId, firebaseUid);
            const owned = this.ownership.assertOwner(conversation, firebaseUid);
            const messageList = await this.messages.listByConversationId(conversationId);
            return (0, result_1.ok)(owned.withMessages(messageList));
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                return (0, result_1.err)(error);
            }
            throw error;
        }
    }
};
exports.GetConversationUseCase = GetConversationUseCase;
exports.GetConversationUseCase = GetConversationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(conversation_repository_1.CONVERSATION_REPOSITORY)),
    __param(1, (0, common_1.Inject)(message_repository_1.MESSAGE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, conversation_ownership_policy_1.ConversationOwnershipPolicy])
], GetConversationUseCase);
//# sourceMappingURL=get-conversation.use-case.js.map