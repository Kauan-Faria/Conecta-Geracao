import { AuthenticatedUser } from '../../../shared/auth/current-user.decorator';
import { CreateConversationUseCase } from '../application/use-cases/create-conversation.use-case';
import { ListConversationsUseCase } from '../application/use-cases/list-conversations.use-case';
import { GetConversationUseCase } from '../application/use-cases/get-conversation.use-case';
import { SendMessageUseCase } from '../application/use-cases/send-message.use-case';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ListConversationsQueryDto } from './dto/list-conversations.query.dto';
export declare class ConversationsController {
    private readonly createConversation;
    private readonly listConversations;
    private readonly getConversation;
    private readonly sendMessage;
    constructor(createConversation: CreateConversationUseCase, listConversations: ListConversationsUseCase, getConversation: GetConversationUseCase, sendMessage: SendMessageUseCase);
    create(user: AuthenticatedUser, dto: CreateConversationDto): Promise<import("./mappers/conversation.mapper").ConversationSummaryDto>;
    list(user: AuthenticatedUser, query: ListConversationsQueryDto): Promise<import("../../../shared/http/paginated-response").PaginatedPayload<import("./mappers/conversation.mapper").ConversationSummaryDto>>;
    getById(user: AuthenticatedUser, id: string): Promise<import("./mappers/conversation.mapper").ConversationDetailDto>;
    postMessage(user: AuthenticatedUser, id: string, dto: SendMessageDto): Promise<import("./mappers/conversation.mapper").MessageDto>;
    private mapDomainError;
}
