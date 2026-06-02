import { TopicInferencePolicy } from './topic-inference.policy';

describe('TopicInferencePolicy', () => {
  const policy = new TopicInferencePolicy();

  const topics = [
    { slug: 'fazer-pix', keywords: ['pix', 'transferencia'] },
    { slug: 'alerta-golpe', keywords: ['golpe', 'fraude'] },
  ];

  it('infere fazer-pix por keyword', () => {
    expect(policy.inferSlug('quero fazer um pix', topics)).toBe('fazer-pix');
  });

  it('retorna null sem match', () => {
    expect(policy.inferSlug('bom dia', topics)).toBeNull();
  });
});
