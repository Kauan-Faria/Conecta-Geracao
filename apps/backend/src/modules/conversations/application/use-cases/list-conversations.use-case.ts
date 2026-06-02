import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../shared/result';
import { Conversation } from '../../domain/entities/conversation.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import {
  CONVERSATION_REPOSITORY,
  ConversationRepository,
  PaginationParams,
} from '../ports/conversation.repository';

export interface ListConversationsResult {
  items: Conversation[];
  total: number;
}

@Injectable()
export class ListConversationsUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversations: ConversationRepository,
  ) {}

  async execute(
    firebaseUid: string,
    pagination: PaginationParams,
  ): Promise<Result<ListConversationsResult, DomainError>> {
    const result = await this.conversations.listByUser(firebaseUid, pagination);
    return ok(result);
  }
}
