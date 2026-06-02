import { KnowledgeContentPolicy } from './knowledge-content-policy';
import { KnowledgeTopic } from '../entities/knowledge-topic.entity';
import { ContentPolicyViolationError } from '../errors/domain.errors';

describe('KnowledgeContentPolicy', () => {
  const policy = new KnowledgeContentPolicy();

  const validTopic = () =>
    KnowledgeTopic.create({
      slug: 'fazer-pix',
      title: 'PIX',
      summary: 'Resumo',
      keywords: ['pix'],
      displayOrder: 1,
      steps: [
        { order: 1, instruction: 'Abra o app do banco.' },
        { order: 2, instruction: 'Toque em PIX.' },
        { order: 3, instruction: 'Confirme o valor.' },
      ],
    });

  it('should pass valid topic', () => {
    expect(() => policy.validateTopic(validTopic())).not.toThrow();
  });

  it('should reject instruction asking for password', () => {
    const topic = KnowledgeTopic.create({
      slug: 'fazer-pix',
      title: 'PIX',
      summary: 'Resumo',
      keywords: ['pix'],
      displayOrder: 1,
      steps: [
        { order: 1, instruction: 'Digite sua senha aqui no chat.' },
        { order: 2, instruction: 'Passo dois.' },
        { order: 3, instruction: 'Passo três.' },
      ],
    });
    expect(() => policy.validateTopic(topic)).toThrow(ContentPolicyViolationError);
  });

  it('should reject gov.br login instructions', () => {
    const topic = KnowledgeTopic.create({
      slug: 'codigo-govbr',
      title: 'Gov.br',
      summary: 'Resumo',
      keywords: ['gov'],
      displayOrder: 2,
      steps: [
        { order: 1, instruction: 'Faça login no Gov.br agora.' },
        { order: 2, instruction: 'Passo dois.' },
        { order: 3, instruction: 'Passo três.' },
      ],
    });
    expect(() => policy.validateTopic(topic)).toThrow(ContentPolicyViolationError);
  });
});
