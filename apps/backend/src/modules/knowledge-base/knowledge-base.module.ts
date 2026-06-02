import { Module } from '@nestjs/common';
import { KnowledgeContentPolicy } from './domain/services/knowledge-content-policy';
import { KNOWLEDGE_TOPIC_REPOSITORY } from './application/ports/knowledge-topic.repository';
import { PrismaKnowledgeTopicRepository } from './infrastructure/persistence/prisma-knowledge-topic.repository';
import { SeedKnowledgeBaseUseCase } from './application/use-cases/seed-knowledge-base.use-case';
import { GetTopicBySlugUseCase } from './application/use-cases/get-topic-by-slug.use-case';

@Module({
  providers: [
    KnowledgeContentPolicy,
    {
      provide: KNOWLEDGE_TOPIC_REPOSITORY,
      useClass: PrismaKnowledgeTopicRepository,
    },
    SeedKnowledgeBaseUseCase,
    GetTopicBySlugUseCase,
  ],
  exports: [
    KNOWLEDGE_TOPIC_REPOSITORY,
    SeedKnowledgeBaseUseCase,
    GetTopicBySlugUseCase,
  ],
})
export class KnowledgeBaseModule {}
