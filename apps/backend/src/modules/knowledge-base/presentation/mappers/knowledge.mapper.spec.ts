import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { toTopicDetail, toTopicSummary } from './knowledge.mapper';

function makeTopic() {
  return KnowledgeTopic.create({
    slug: 'fazer-pix',
    title: 'Como fazer um PIX',
    summary: 'Transferência via app do banco',
    keywords: ['pix', 'transferência'],
    displayOrder: 1,
    steps: [
      {
        order: 1,
        instruction: 'Abra o app do banco',
        checkpointQuestion: 'Você já abriu o app?',
        checkpointHints: ['sim', 'não'],
      },
      { order: 2, instruction: 'Toque em PIX' },
      { order: 3, instruction: 'Confirme a transferência' },
    ],
  });
}

describe('knowledge.mapper', () => {
  it('toTopicSummary omite passos', () => {
    const summary = toTopicSummary(makeTopic());
    expect(summary).toEqual({
      slug: 'fazer-pix',
      title: 'Como fazer um PIX',
      summary: 'Transferência via app do banco',
      keywords: ['pix', 'transferência'],
      displayOrder: 1,
    });
    expect(summary).not.toHaveProperty('steps');
  });

  it('toTopicDetail inclui passos ordenados com checkpoints', () => {
    const detail = toTopicDetail(makeTopic());
    expect(detail.steps).toHaveLength(3);
    expect(detail.steps[0]).toEqual({
      order: 1,
      instruction: 'Abra o app do banco',
      checkpointQuestion: 'Você já abriu o app?',
      checkpointHints: ['sim', 'não'],
    });
    expect(detail.steps[1].checkpointQuestion).toBeNull();
  });
});
