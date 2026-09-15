import { TopicMatch } from '../value-objects/topic-match.vo';
import { TOPIC_CATALOG } from '../testing/relevance-corpus';
import { ClarificationQuestionPolicy } from './clarification-question.policy';

describe('ClarificationQuestionPolicy', () => {
  const policy = new ClarificationQuestionPolicy();

  it('empate Wi-Fi vs Gov.br oferece no máximo 2 opções', () => {
    const question = policy.compose(
      TopicMatch.tie([
        { slug: 'wifi-qr-code', score: 4, matchedTerms: ['qr'] },
        { slug: 'codigo-govbr', score: 3.5, matchedTerms: ['codigo'] },
      ]),
      TOPIC_CATALOG,
    );
    expect(question.options).toHaveLength(2);
    expect(question.text).toContain('ou com');
    expect(question.text.toLowerCase()).not.toContain('pix');
    expect(question.text.toLowerCase()).not.toContain('boleto');
    expect(question.text.toLowerCase()).not.toContain('whatsapp');
    expect(question.text.toLowerCase()).not.toContain('golpe');
  });

  it('vago não lista os 6 tópicos', () => {
    const question = policy.compose(TopicMatch.none(), TOPIC_CATALOG);
    expect(question.text).toBe('O que você está tentando fazer agora?');
    expect(question.options).toEqual([]);
    expect(question.text).not.toContain('Gov.br');
    expect(question.text).not.toContain('PIX');
  });
});
