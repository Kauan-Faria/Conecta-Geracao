import { Inject, Injectable } from '@nestjs/common';
import { ok, err, Result } from '../../../../shared/result';
import { Conversation } from '../../domain/entities/conversation.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { ConversationStatus } from '../../domain/value-objects/conversation-status.vo';
import { TopicSlugRef } from '../../domain/value-objects/topic-slug-ref.vo';
import {
  CONVERSATION_REPOSITORY,
  ConversationRepository,
} from '../ports/conversation.repository';

@Injectable()
export class CreateConversationUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversations: ConversationRepository,
  ) {}

  async execute(
    firebaseUid: string,
    topicSlug?: string,
  ): Promise<Result<Conversation, DomainError>> {
    try {
      const slugRef = TopicSlugRef.createOptional(topicSlug);
      const conversation = Conversation.create({
        firebaseUid,
        topicSlug: slugRef?.value ?? null,
        status: ConversationStatus.inProgress(),
        currentStep: 0,
      });
      const saved = await this.conversations.create(conversation);
      return ok(saved);
    } catch (error) {
      if (error instanceof DomainError) {
        return err(error);
      }
      throw error;
    }
  }
}
