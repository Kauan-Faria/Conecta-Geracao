import { Module } from '@nestjs/common';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConversationOwnershipPolicy } from './domain/services/conversation-ownership.policy';
import { CONVERSATION_REPOSITORY } from './application/ports/conversation.repository';
import {
  CONVERSATION_MESSAGE_UOW,
  MESSAGE_REPOSITORY,
} from './application/ports/message.repository';
import { ASSISTANT_REPLY_GENERATOR } from './application/ports/assistant-reply.generator';
import {
  PrismaConversationMessageUnitOfWork,
  PrismaConversationRepository,
  PrismaMessageRepository,
} from './infrastructure/persistence/prisma-conversation.repository';
import { KNOWLEDGE_RETRIEVER } from './application/ports/knowledge-retriever';
import { LLM_PROVIDER } from './application/ports/llm-provider';
import { GeminiAssistantReplyGenerator } from './infrastructure/assistant/gemini-assistant-reply.generator';
import { GeminiService } from './infrastructure/assistant/gemini.service';
import { PrismaKnowledgeRetriever } from './infrastructure/knowledge/prisma-knowledge-retriever';
import { SensitiveContentPolicy } from './domain/services/sensitive-content.policy';
import { CheckpointResponsePolicy } from './domain/services/checkpoint-response.policy';
import { CreateConversationUseCase } from './application/use-cases/create-conversation.use-case';
import { ListConversationsUseCase } from './application/use-cases/list-conversations.use-case';
import { GetConversationUseCase } from './application/use-cases/get-conversation.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { ReplyGuestMessageUseCase } from './application/use-cases/reply-guest-message.use-case';
import { ConversationsController } from './presentation/conversations.controller';
import { GuestChatController } from './presentation/guest-chat.controller';

@Module({
  imports: [KnowledgeBaseModule, NotificationsModule],
  controllers: [ConversationsController, GuestChatController],
  providers: [
    ConversationOwnershipPolicy,
    SensitiveContentPolicy,
    CheckpointResponsePolicy,
    {
      provide: CONVERSATION_REPOSITORY,
      useClass: PrismaConversationRepository,
    },
    {
      provide: MESSAGE_REPOSITORY,
      useClass: PrismaMessageRepository,
    },
    {
      provide: CONVERSATION_MESSAGE_UOW,
      useClass: PrismaConversationMessageUnitOfWork,
    },
    {
      provide: KNOWLEDGE_RETRIEVER,
      useClass: PrismaKnowledgeRetriever,
    },
    {
      provide: LLM_PROVIDER,
      useClass: GeminiService,
    },
    {
      provide: ASSISTANT_REPLY_GENERATOR,
      useClass: GeminiAssistantReplyGenerator,
    },
    CreateConversationUseCase,
    ListConversationsUseCase,
    GetConversationUseCase,
    SendMessageUseCase,
    ReplyGuestMessageUseCase,
  ],
})
export class ConversationsModule {}
