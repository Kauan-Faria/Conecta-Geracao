import { GetTopicBySlugUseCase } from './get-topic-by-slug.use-case';
import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { KnowledgeTopicRepository } from '../ports/knowledge-topic.repository';

function makeTopic() {
  return KnowledgeTopic.create({
    slug: 'fazer-pix',
    title: 'Como fazer um PIX',
    summary: 'Transferência via app do banco',
    keywords: ['pix'],
    displayOrder: 1,
    steps: [
      { order: 1, instruction: 'Abra o app do banco', checkpointQuestion: 'Você já abriu?' },
      { order: 2, instruction: 'Toque em PIX' },
      { order: 3, instruction: 'Confirme a transferência' },
    ],
  });
}

describe('GetTopicBySlugUseCase', () => {
  it('retorna tópico quando slug existe', async () => {
    const topic = makeTopic();
    const repository: Pick<KnowledgeTopicRepository, 'findBySlug'> = {
      findBySlug: jest.fn().mockResolvedValue(topic),
    };
    const useCase = new GetTopicBySlugUseCase(repository as KnowledgeTopicRepository);

    const result = await useCase.execute('fazer-pix');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.slug).toBe('fazer-pix');
      expect(result.value.steps).toHaveLength(3);
      expect(result.value.steps[0].order).toBe(1);
    }
  });

  it('retorna TOPIC_NOT_FOUND quando slug não existe', async () => {
    const repository: Pick<KnowledgeTopicRepository, 'findBySlug'> = {
      findBySlug: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GetTopicBySlugUseCase(repository as KnowledgeTopicRepository);

    const result = await useCase.execute('inexistente');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('TOPIC_NOT_FOUND');
    }
  });

  it('retorna INVALID_SLUG para slug malformado', async () => {
    const repository: Pick<KnowledgeTopicRepository, 'findBySlug'> = {
      findBySlug: jest.fn(),
    };
    const useCase = new GetTopicBySlugUseCase(repository as KnowledgeTopicRepository);

    const result = await useCase.execute('Slug Inválido!');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_SLUG');
    }
    expect(repository.findBySlug).not.toHaveBeenCalled();
  });
});
