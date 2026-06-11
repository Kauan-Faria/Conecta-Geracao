import {
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Body,
  Query,
  Headers,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FirebaseAuthGuard } from '../../../shared/auth/firebase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../../shared/auth/current-user.decorator';
import { paginated } from '../../../shared/http/paginated-response';
import { DomainError } from '../domain/errors/domain.errors';
import { CreateConversationUseCase } from '../application/use-cases/create-conversation.use-case';
import { ListConversationsUseCase } from '../application/use-cases/list-conversations.use-case';
import { GetConversationUseCase } from '../application/use-cases/get-conversation.use-case';
import { SendMessageUseCase } from '../application/use-cases/send-message.use-case';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ListConversationsQueryDto } from './dto/list-conversations.query.dto';
import {
  toConversationDetail,
  toConversationSummary,
  toMessageDto,
} from './mappers/conversation.mapper';

function resolveAppInBackground(
  appStateHeader?: string,
  appStateBody?: 'foreground' | 'background',
): boolean {
  if (appStateHeader) {
    return appStateHeader.toLowerCase() === 'background';
  }
  if (appStateBody) {
    return appStateBody === 'background';
  }
  return false;
}

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly createConversation: CreateConversationUseCase,
    private readonly listConversations: ListConversationsUseCase,
    private readonly getConversation: GetConversationUseCase,
    private readonly sendMessage: SendMessageUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova conversa' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateConversationDto) {
    const result = await this.createConversation.execute(user.uid, dto.topicSlug);
    if (!result.ok) throw this.mapDomainError(result.error);
    return toConversationSummary(result.value);
  }

  @Get()
  @ApiOperation({ summary: 'Listar conversas do usuário' })
  async list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListConversationsQueryDto) {
    const result = await this.listConversations.execute(user.uid, {
      page: query.page,
      limit: query.limit,
    });
    if (!result.ok) throw this.mapDomainError(result.error);
    return paginated(
      result.value.items.map(toConversationSummary),
      query.page,
      query.limit,
      result.value.total,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter conversa com mensagens' })
  async getById(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const result = await this.getConversation.execute(user.uid, id);
    if (!result.ok) throw this.mapDomainError(result.error);
    return toConversationDetail(result.value);
  }

  @Post(':id/messages')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Enviar mensagem e receber resposta stub do assistente' })
  async postMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Headers('x-app-state') appStateHeader?: string,
  ) {
    const appInBackground = resolveAppInBackground(appStateHeader, dto.appState);
    const result = await this.sendMessage.execute(user.uid, id, dto.content, {
      appInBackground,
    });
    if (!result.ok) throw this.mapDomainError(result.error);
    return toMessageDto(result.value);
  }

  private mapDomainError(error: DomainError): never {
    switch (error.code) {
      case 'CONVERSATION_NOT_FOUND':
        throw new NotFoundException({
          error: { code: 'NOT_FOUND', message: error.message },
        });
      case 'CONVERSATION_CLOSED':
        throw new ConflictException({
          error: { code: 'CONVERSATION_CLOSED', message: error.message },
        });
      case 'INVALID_MESSAGE_CONTENT':
      case 'INVALID_TOPIC_SLUG':
        throw new BadRequestException({
          error: { code: 'VALIDATION_ERROR', message: error.message },
        });
      default:
        throw new BadRequestException({
          error: { code: 'VALIDATION_ERROR', message: error.message },
        });
    }
  }
}
