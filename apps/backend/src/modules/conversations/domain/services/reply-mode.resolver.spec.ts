import { TopicMatch } from '../value-objects/topic-match.vo';
import { ClarificationStreak } from '../value-objects/clarification-streak.vo';
import { ReplyModeResolver } from './reply-mode.resolver';

describe('ReplyModeResolver', () => {
  const resolver = new ReplyModeResolver();
  const wifi = TopicMatch.high('wifi-qr-code', [
    { slug: 'wifi-qr-code', score: 8, matchedTerms: ['wifi'] },
  ]);
  const tie = TopicMatch.tie([
    { slug: 'wifi-qr-code', score: 4, matchedTerms: ['qr'] },
    { slug: 'codigo-govbr', score: 4, matchedTerms: ['codigo'] },
  ]);

  it('tie → clarify sem gravar slug', () => {
    const plan = resolver.resolve({
      match: tie,
      persisted: null,
      substance: 'vacuous',
      streak: new ClarificationStreak(0),
      isCheckpoint: false,
      checkpointDecision: 'unchanged',
    });
    expect(plan.mode).toBe('clarify');
    expect(plan.resolvedTopicSlug(null)).toBeNull();
  });

  it('3ª mensagem ainda vaga → general', () => {
    const plan = resolver.resolve({
      match: TopicMatch.none(),
      persisted: null,
      substance: 'vacuous',
      streak: new ClarificationStreak(2),
      isCheckpoint: false,
      checkpointDecision: 'unchanged',
    });
    expect(plan.mode).toBe('general');
    expect(plan.persist).toBe('clear');
  });

  it('Instagram fora do catálogo → general e limpa slug', () => {
    const plan = resolver.resolve({
      match: TopicMatch.none(),
      persisted: 'codigo-govbr',
      substance: 'outOfCatalog',
      streak: new ClarificationStreak(0),
      isCheckpoint: false,
      checkpointDecision: 'unchanged',
    });
    expect(plan.mode).toBe('general');
    expect(plan.resolvedTopicSlug('codigo-govbr')).toBeNull();
    expect(plan.switchOccurred).toBe(true);
  });

  it('Gov.br → Wi-Fi troca e zera passo', () => {
    const plan = resolver.resolve({
      match: wifi,
      persisted: 'codigo-govbr',
      substance: 'catalog',
      streak: new ClarificationStreak(0),
      isCheckpoint: false,
      checkpointDecision: 'unchanged',
    });
    expect(plan.mode).toBe('rag');
    expect(plan.switchOccurred).toBe(true);
    expect(plan.step).toBe('resetToZero');
    expect(plan.resolvedTopicSlug('codigo-govbr')).toBe('wifi-qr-code');
  });

  it('sim com tópico persistido não troca', () => {
    const plan = resolver.resolve({
      match: TopicMatch.none(),
      persisted: 'fazer-pix',
      substance: 'checkpoint',
      streak: new ClarificationStreak(0),
      isCheckpoint: true,
      checkpointDecision: 'advance',
    });
    expect(plan.mode).toBe('rag');
    expect(plan.switchOccurred).toBe(false);
    expect(plan.step).toBe('advance');
    expect(plan.resolvedTopicSlug('fazer-pix')).toBe('fazer-pix');
  });

  it('sim após clarify não avança tutorial', () => {
    const plan = resolver.resolve({
      match: TopicMatch.none(),
      persisted: 'codigo-govbr',
      substance: 'vacuous',
      streak: new ClarificationStreak(1),
      isCheckpoint: true,
      checkpointDecision: 'advance',
    });
    expect(plan.mode).toBe('clarify');
    expect(plan.step).not.toBe('advance');
  });

  it('mesmo tópico high não zera o passo', () => {
    const plan = resolver.resolve({
      match: wifi,
      persisted: 'wifi-qr-code',
      substance: 'catalog',
      streak: new ClarificationStreak(0),
      isCheckpoint: false,
      checkpointDecision: 'unchanged',
    });
    expect(plan.switchOccurred).toBe(false);
    expect(plan.step).toBe('keep');
  });
});
