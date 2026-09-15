import { KnowledgeTopic } from '../../../knowledge-base/domain/entities/knowledge-topic.entity';
import { TopicSlug } from '../../../knowledge-base/domain/value-objects/topic-slug.vo';
import { MVP_TOPICS_DATA } from '../../../knowledge-base/infrastructure/seed/mvp-topics.data';
import { PrismaKnowledgeRetriever } from './prisma-knowledge-retriever';

describe('PrismaKnowledgeRetriever', () => {
  const topics = MVP_TOPICS_DATA.map((data) => KnowledgeTopic.create(data));

  const repository = {
    findAllActive: jest.fn().mockResolvedValue(topics),
    findBySlug: jest.fn(async (slug: TopicSlug) => {
      return topics.find((topic) => topic.slug === slug.value) ?? null;
    }),
  };

  const retriever = new PrismaKnowledgeRetriever(repository as never);

  it('mensagem de Wi-Fi injeta só passos de Wi-Fi', async () => {
    const context = await retriever.retrieve({
      userMessage: 'como passo a senha do wi-fi',
    });

    expect(context.topicSlug).toBe('wifi-qr-code');
    expect(context.steps.length).toBeGreaterThan(0);
    const blob = context.steps.map((s) => s.instruction).join(' ');
    expect(blob.toLowerCase()).not.toContain('gov.br');
    expect(blob.toLowerCase()).toContain('wi-fi');
  });

  it('slug persistido Gov.br não trava mensagem de Wi-Fi', async () => {
    const context = await retriever.retrieve({
      topicSlug: 'codigo-govbr',
      userMessage: 'senha do wifi por qr',
    });

    expect(context.topicSlug).toBe('wifi-qr-code');
    expect(context.inferredFromMessage).toBe(true);
    const blob = context.steps.map((s) => s.instruction).join(' ');
    expect(blob.toLowerCase()).not.toContain('gov.br');
  });

  it('tie/low não injeta passos', async () => {
    const context = await retriever.retrieve({
      topicSlug: 'codigo-govbr',
      userMessage: 'código',
    });

    expect(context.topicSlug).toBeNull();
    expect(context.steps).toEqual([]);
  });

  it('none sem persistido fica vazio', async () => {
    const context = await retriever.retrieve({ userMessage: 'bom dia' });
    expect(context.topicSlug).toBeNull();
    expect(context.steps).toEqual([]);
  });

  it('none com persistido continua o tópico (checkpoint)', async () => {
    const context = await retriever.retrieve({
      topicSlug: 'fazer-pix',
      userMessage: 'sim',
    });

    expect(context.topicSlug).toBe('fazer-pix');
    expect(context.inferredFromMessage).toBe(false);
    expect(context.steps.length).toBeGreaterThan(0);
  });

  it('inferMatch devolve TopicMatch sem montar steps', async () => {
    const inferred = await retriever.inferMatch('como usar o Instagram');
    expect(inferred.match.confidence).toBe('none');
    expect(inferred.catalog.length).toBe(6);
  });
});
