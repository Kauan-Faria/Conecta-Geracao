import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/auth/firebase-auth.guard';
import { GetTopicBySlugUseCase } from '../application/use-cases/get-topic-by-slug.use-case';
import { SearchTopicsUseCase } from '../application/use-cases/search-topics.use-case';
import { DomainError } from '../domain/errors/domain.errors';
import { SearchKnowledgeQueryDto } from './dto/search-knowledge.query.dto';
import { toTopicDetail, toTopicSummary } from './mappers/knowledge.mapper';

@ApiTags('knowledge')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(
    private readonly getTopicBySlug: GetTopicBySlugUseCase,
    private readonly searchTopics: SearchTopicsUseCase,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Buscar tópicos por palavra-chave' })
  async search(@Query() query: SearchKnowledgeQueryDto) {
    const result = await this.searchTopics.execute(query.q);
    if (!result.ok) throw this.mapDomainError(result.error);
    return result.value.map(toTopicSummary);
  }

  @Get('topics/:slug')
  @ApiOperation({ summary: 'Obter tópico completo com passos ordenados' })
  async getBySlug(@Param('slug') slug: string) {
    const result = await this.getTopicBySlug.execute(slug);
    if (!result.ok) throw this.mapDomainError(result.error);
    return toTopicDetail(result.value);
  }

  private mapDomainError(error: DomainError): never {
    switch (error.code) {
      case 'TOPIC_NOT_FOUND':
        throw new NotFoundException({
          error: { code: 'NOT_FOUND', message: error.message },
        });
      case 'INVALID_SLUG':
      case 'INVALID_SEARCH_QUERY':
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
