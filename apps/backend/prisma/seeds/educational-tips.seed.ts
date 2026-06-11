import { PrismaClient } from '@prisma/client';

export const EDUCATIONAL_TIPS_SEED = [
  {
    topicTag: 'golpes',
    title: 'Cuidado com golpes',
    body: 'Desconfie de links suspeitos no WhatsApp. Toque para saber mais.',
    deepLink: '/chat?topic=golpes',
    sortOrder: 1,
  },
  {
    topicTag: 'privacidade',
    title: 'Proteja sua privacidade',
    body: 'Revise permissões do celular regularmente. Toque para dicas.',
    deepLink: '/',
    sortOrder: 2,
  },
  {
    topicTag: 'senhas',
    title: 'Senhas mais seguras',
    body: 'Use senhas diferentes para cada app. Toque para aprender.',
    deepLink: '/chat?topic=senhas',
    sortOrder: 3,
  },
] as const;

export async function seedEducationalTips(prisma: PrismaClient): Promise<number> {
  let seeded = 0;

  for (const tip of EDUCATIONAL_TIPS_SEED) {
    await prisma.educationalTip.upsert({
      where: { topicTag: tip.topicTag },
      create: {
        title: tip.title,
        body: tip.body,
        deepLink: tip.deepLink,
        topicTag: tip.topicTag,
        sortOrder: tip.sortOrder,
        isActive: true,
      },
      update: {
        title: tip.title,
        body: tip.body,
        deepLink: tip.deepLink,
        sortOrder: tip.sortOrder,
        isActive: true,
      },
    });
    seeded += 1;
  }

  return seeded;
}
