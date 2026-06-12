"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsModule = void 0;
const common_1 = require("@nestjs/common");
const knowledge_base_module_1 = require("../knowledge-base/knowledge-base.module");
const notifications_module_1 = require("../notifications/notifications.module");
const conversation_ownership_policy_1 = require("./domain/services/conversation-ownership.policy");
const conversation_repository_1 = require("./application/ports/conversation.repository");
const message_repository_1 = require("./application/ports/message.repository");
const assistant_reply_generator_1 = require("./application/ports/assistant-reply.generator");
const prisma_conversation_repository_1 = require("./infrastructure/persistence/prisma-conversation.repository");
const knowledge_retriever_1 = require("./application/ports/knowledge-retriever");
const llm_provider_1 = require("./application/ports/llm-provider");
const gemini_assistant_reply_generator_1 = require("./infrastructure/assistant/gemini-assistant-reply.generator");
const gemini_service_1 = require("./infrastructure/assistant/gemini.service");
const prisma_knowledge_retriever_1 = require("./infrastructure/knowledge/prisma-knowledge-retriever");
const sensitive_content_policy_1 = require("./domain/services/sensitive-content.policy");
const checkpoint_response_policy_1 = require("./domain/services/checkpoint-response.policy");
const create_conversation_use_case_1 = require("./application/use-cases/create-conversation.use-case");
const list_conversations_use_case_1 = require("./application/use-cases/list-conversations.use-case");
const get_conversation_use_case_1 = require("./application/use-cases/get-conversation.use-case");
const send_message_use_case_1 = require("./application/use-cases/send-message.use-case");
const reply_guest_message_use_case_1 = require("./application/use-cases/reply-guest-message.use-case");
const conversations_controller_1 = require("./presentation/conversations.controller");
const guest_chat_controller_1 = require("./presentation/guest-chat.controller");
let ConversationsModule = class ConversationsModule {
};
exports.ConversationsModule = ConversationsModule;
exports.ConversationsModule = ConversationsModule = __decorate([
    (0, common_1.Module)({
        imports: [knowledge_base_module_1.KnowledgeBaseModule, notifications_module_1.NotificationsModule],
        controllers: [conversations_controller_1.ConversationsController, guest_chat_controller_1.GuestChatController],
        providers: [
            conversation_ownership_policy_1.ConversationOwnershipPolicy,
            sensitive_content_policy_1.SensitiveContentPolicy,
            checkpoint_response_policy_1.CheckpointResponsePolicy,
            {
                provide: conversation_repository_1.CONVERSATION_REPOSITORY,
                useClass: prisma_conversation_repository_1.PrismaConversationRepository,
            },
            {
                provide: message_repository_1.MESSAGE_REPOSITORY,
                useClass: prisma_conversation_repository_1.PrismaMessageRepository,
            },
            {
                provide: message_repository_1.CONVERSATION_MESSAGE_UOW,
                useClass: prisma_conversation_repository_1.PrismaConversationMessageUnitOfWork,
            },
            {
                provide: knowledge_retriever_1.KNOWLEDGE_RETRIEVER,
                useClass: prisma_knowledge_retriever_1.PrismaKnowledgeRetriever,
            },
            {
                provide: llm_provider_1.LLM_PROVIDER,
                useClass: gemini_service_1.GeminiService,
            },
            {
                provide: assistant_reply_generator_1.ASSISTANT_REPLY_GENERATOR,
                useClass: gemini_assistant_reply_generator_1.GeminiAssistantReplyGenerator,
            },
            create_conversation_use_case_1.CreateConversationUseCase,
            list_conversations_use_case_1.ListConversationsUseCase,
            get_conversation_use_case_1.GetConversationUseCase,
            send_message_use_case_1.SendMessageUseCase,
            reply_guest_message_use_case_1.ReplyGuestMessageUseCase,
        ],
    })
], ConversationsModule);
//# sourceMappingURL=conversations.module.js.map