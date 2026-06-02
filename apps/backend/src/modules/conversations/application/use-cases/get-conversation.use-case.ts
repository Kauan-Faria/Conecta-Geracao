import { Inject, Injectable } from '@nestjs/common';
import { ok, err, Result } from '../../../../shared/result';
import { Conversation } from '../../domain/entities/conversation.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { ConversationOwnershipPolicy } from '../../domain/services/conversation-ownership.policy';
import {
  CONVERSATION_REPOSITORY,
  ConversationRepository,
} from '../ports/conversation.repository';
import {
  MESSAGE_REPOSITORY,
  MessageRepository,
} from '../ports/message.repository';

@Injectable()
export class GetConversationUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversations: ConversationRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messages: MessageRepository,
    private readonly ownership: ConversationOwnershipPolicy,
  ) {}

  async execute(
    firebaseUid: string,
    conversationId: string,
  ): Promise<Result<Conversation, DomainError>> {
    try {
      const conversation = await this.conversations.findByIdForUser(conversationId, firebaseUid);
      const owned = this.ownership.assertOwner(conversation, firebaseUid);
      const messageList = await this.messages.listByConversationId(conversationId);
      return ok(owned.withMessages(messageList));
    } catch (error) {
      if (error instanceof DomainError) {
        return err(error);
      }
      throw error;
    }
  }
}
