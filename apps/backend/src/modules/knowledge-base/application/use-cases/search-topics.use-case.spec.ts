import { SearchTopicsUseCase } from './search-topics.use-case';
import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { KnowledgeTopicRepository } from '../ports/knowledge-topic.repository';

function makeTopic(overrides: Partial<Parameters<typeof KnowledgeTopic.create>[0]> = {}) {
  return KnowledgeTopic.create({
    slug: 'fazer-pix',
    title: 'Como fazer um PIX',
    summary: 'Transferência via app do banco',
    keywords: ['pix', 'transferência'],
    displayOrder: 1,
    steps: [
      { order: 1, instruction: 'Abra o app do banco' },
      { order: 2, instruction: 'Toque em PIX' },
      { order: 3, instruction: 'Confirme a transferência' },
    ],
    ...overrides,
  });
}

describe('SearchTopicsUseCase', () => {
  const pixTopic = makeTopic();
  const govTopic = makeTopic({
    slug: 'codigo-govbr',
    title: 'Código Gov.br',
    summary: 'Tutorial educativo sobre Gov.br',
    keywords: ['gov.br', 'código'],
    displayOrder: 2,
  });

  it('retorna tópicos encontrados pela busca', async () => {
    const repository: Pick<KnowledgeTopicRepository, 'searchActive'> = {
      searchActive: jest.fn().mockResolvedValue([pixTopic]),
    };
    const useCase = new SearchTopicsUseCase(repository as KnowledgeTopicRepository);

    const result = await useCase.execute('pix');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0].slug).toBe('fazer-pix');
    }
    expect(repository.searchActive).toHaveBeenCalledWith('pix');
  });

  it('retorna lista vazia quando nenhum tópico corresponde', async () => {
    const repository: Pick<KnowledgeTopicRepository, 'searchActive'> = {
      searchActive: jest.fn().mockResolvedValue([]),
    };
    const useCase = new SearchTopicsUseCase(repository as KnowledgeTopicRepository);

    const result = await useCase.execute('inexistente');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([]);
    }
  });

  it('retorna erro de validação para query curta', async () => {
    const repository: Pick<KnowledgeTopicRepository, 'searchActive'> = {
      searchActive: jest.fn(),
    };
    const useCase = new SearchTopicsUseCase(repository as KnowledgeTopicRepository);

    const result = await useCase.execute('a');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_SEARCH_QUERY');
    }
    expect(repository.searchActive).not.toHaveBeenCalled();
  });
});

describe('SearchTopicsUseCase — integração com múltiplos tópicos (mock)', () => {
  it('repository searchActive filtra por keywords', async () => {
    const pixTopic = makeTopic();
    const govTopic = makeTopic({
      slug: 'codigo-govbr',
      title: 'Código Gov.br',
      summary: 'Tutorial educativo',
      keywords: ['gov.br'],
      displayOrder: 2,
    });

    const allTopics = [pixTopic, govTopic];
    const repository: Pick<KnowledgeTopicRepository, 'searchActive'> = {
      searchActive: jest.fn(async (query: string) => {
        const normalized = query.toLowerCase();
        return allTopics.filter(
          (t) =>
            t.slug.includes(normalized) ||
            t.title.toLowerCase().includes(normalized) ||
            t.keywords.some((k) => k.toLowerCase().includes(normalized)),
        );
      }),
    };
    const useCase = new SearchTopicsUseCase(repository as KnowledgeTopicRepository);

    const result = await useCase.execute('gov');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.map((t) => t.slug)).toEqual(['codigo-govbr']);
    }
  });
});
