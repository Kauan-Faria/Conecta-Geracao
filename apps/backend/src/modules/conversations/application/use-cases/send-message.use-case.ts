import { Inject, Injectable } from '@nestjs/common';
import { ok, err, Result } from '../../../../shared/result';
import { Message } from '../../domain/entities/conversation.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { MessageContent } from '../../domain/value-objects/message-content.vo';
import { MessageMetadata } from '../../domain/value-objects/message-metadata.vo';
import {
  ASSISTANT_REPLY_GENERATOR,
  AssistantReplyGenerator,
} from '../ports/assistant-reply.generator';
import {
  ASSISTANT_REPLY_NOTIFICATION_TRIGGER,
  AssistantReplyNotificationTrigger,
} from '../../../notifications/application/ports/assistant-reply-notification.trigger';
import {
  CONVERSATION_MESSAGE_UOW,
  ConversationMessageUnitOfWork,
  MESSAGE_REPOSITORY,
  MessageRepository,
} from '../ports/message.repository';
import {
  CONVERSATION_REPOSITORY,
  ConversationRepository,
} from '../ports/conversation.repository';
import { ConversationOwnershipPolicy } from '../../domain/services/conversation-ownership.policy';

export interface SendMessageOptions {
  appInBackground?: boolean;
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversations: ConversationRepository,
    @Inject(CONVERSATION_MESSAGE_UOW)
    private readonly unitOfWork: ConversationMessageUnitOfWork,
    @Inject(ASSISTANT_REPLY_GENERATOR)
    private readonly replyGenerator: AssistantReplyGenerator,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messages: MessageRepository,
    private readonly ownership: ConversationOwnershipPolicy,
    @Inject(ASSISTANT_REPLY_NOTIFICATION_TRIGGER)
    private readonly assistantReplyTrigger: AssistantReplyNotificationTrigger,
  ) {}

  async execute(
    firebaseUid: string,
    conversationId: string,
    rawContent: string,
    options?: SendMessageOptions,
  ): Promise<Result<Message, DomainError>> {
    try {
      const conversation = await this.conversations.findByIdForUser(conversationId, firebaseUid);
      const owned = this.ownership.assertOwner(conversation, firebaseUid);
      owned.assertCanReceiveMessage();

      const userContent = MessageContent.create(rawContent);
      const history = await this.messages.listByConversationId(conversationId);
      const messageHistory = history.slice(-10).map((m) => ({
        role: m.role.value as 'user' | 'assistant',
        content: m.content.value,
      }));

      const assistantReply = await this.replyGenerator.generateReply({
        conversationId,
        userMessage: userContent.value,
        topicSlug: owned.topicSlug,
        currentStep: owned.currentStep,
        messageHistory,
      });

      const assistantMetadata = assistantReply.mapAction
        ? MessageMetadata.fromMapAction(assistantReply.mapAction)
        : null;

      const result = await this.unitOfWork.sendMessage({
        conversationId,
        firebaseUid,
        userContent: userContent.value,
        assistantContent: assistantReply.content.value,
        nextCurrentStep: assistantReply.nextCurrentStep,
        topicSlug: assistantReply.resolvedTopicSlug ?? owned.topicSlug,
        assistantMetadata,
      });

      void this.assistantReplyTrigger.onAssistantReplyReady({
        conversationId,
        firebaseUid,
        appInBackground: options?.appInBackground ?? false,
      });

      return ok(result.assistantMessage);
    } catch (error) {
      if (error instanceof DomainError) {
        return err(error);
      }
      throw error;
    }
  }
}
