import { Result } from '../../../../shared/result';
import { Message } from '../../domain/entities/conversation.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { AssistantReplyGenerator } from '../ports/assistant-reply.generator';
import { AssistantReplyNotificationTrigger } from '../../../notifications/application/ports/assistant-reply-notification.trigger';
import { ConversationMessageUnitOfWork, MessageRepository } from '../ports/message.repository';
import { ConversationRepository } from '../ports/conversation.repository';
import { ConversationOwnershipPolicy } from '../../domain/services/conversation-ownership.policy';
export interface SendMessageOptions {
    appInBackground?: boolean;
}
export declare class SendMessageUseCase {
    private readonly conversations;
    private readonly unitOfWork;
    private readonly replyGenerator;
    private readonly messages;
    private readonly ownership;
    private readonly assistantReplyTrigger;
    constructor(conversations: ConversationRepository, unitOfWork: ConversationMessageUnitOfWork, replyGenerator: AssistantReplyGenerator, messages: MessageRepository, ownership: ConversationOwnershipPolicy, assistantReplyTrigger: AssistantReplyNotificationTrigger);
    execute(firebaseUid: string, conversationId: string, rawContent: string, options?: SendMessageOptions): Promise<Result<Message, DomainError>>;
}
