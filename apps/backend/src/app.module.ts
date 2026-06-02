import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';

@Module({
  imports: [PrismaModule, KnowledgeBaseModule],
})
export class AppModule {}
