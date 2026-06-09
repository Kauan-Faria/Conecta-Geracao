import { Module } from '@nestjs/common';
import { KnowledgeContentPolicy } from './domain/services/knowledge-content-policy';
import { KNOWLEDGE_TOPIC_REPOSITORY } from './application/ports/knowledge-topic.repository';
import { PrismaKnowledgeTopicRepository } from './infrastructure/persistence/prisma-knowledge-topic.repository';
import { SeedKnowledgeBaseUseCase } from './application/use-cases/seed-knowledge-base.use-case';
import { GetTopicBySlugUseCase } from './application/use-cases/get-topic-by-slug.use-case';
import { SearchTopicsUseCase } from './application/use-cases/search-topics.use-case';
import { KnowledgeController } from './presentation/knowledge.controller';

@Module({
  controllers: [KnowledgeController],
  providers: [
    KnowledgeContentPolicy,
    {
      provide: KNOWLEDGE_TOPIC_REPOSITORY,
      useClass: PrismaKnowledgeTopicRepository,
    },
    SeedKnowledgeBaseUseCase,
    GetTopicBySlugUseCase,
    SearchTopicsUseCase,
  ],
  exports: [
    KNOWLEDGE_TOPIC_REPOSITORY,
    SeedKnowledgeBaseUseCase,
    GetTopicBySlugUseCase,
    SearchTopicsUseCase,
  ],
})
export class KnowledgeBaseModule {}
