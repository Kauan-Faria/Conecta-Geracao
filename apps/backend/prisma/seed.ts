import { PrismaClient } from '@prisma/client';
import { KnowledgeContentPolicy } from '../src/modules/knowledge-base/domain/services/knowledge-content-policy';
import { PrismaKnowledgeTopicRepository } from '../src/modules/knowledge-base/infrastructure/persistence/prisma-knowledge-topic.repository';
import { SeedKnowledgeBaseUseCase } from '../src/modules/knowledge-base/application/use-cases/seed-knowledge-base.use-case';
import { seedEducationalTips } from './seeds/educational-tips.seed';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const repository = new PrismaKnowledgeTopicRepository(prisma);
  const contentPolicy = new KnowledgeContentPolicy();
  const seedUseCase = new SeedKnowledgeBaseUseCase(repository, contentPolicy);

  const result = await seedUseCase.execute();

  if (!result.ok) {
    console.error('Seed falhou:', result.error.message);
    process.exit(1);
  }

  if (result.value.skipped) {
    console.log('Seed ignorado: base de conhecimento MVP já existe.');
  } else {
    console.log(`Seed concluído: ${result.value.seeded} tópicos inseridos/atualizados.`);
  }

  const tipsSeeded = await seedEducationalTips(prisma);
  console.log(`Seed dicas educativas: ${tipsSeeded} registros upsert.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
