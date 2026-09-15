import { FuzzyTokenMatcher, levenshtein } from './fuzzy-token-matcher';
import { QueryNormalizer } from './query-normalizer';

describe('FuzzyTokenMatcher', () => {
  const matcher = new FuzzyTokenMatcher();
  const normalizer = new QueryNormalizer();

  it('casa uifi com wifi (1 edição, 4 letras)', () => {
    expect(matcher.matches(normalizer.normalize('uifi'), 'wifi')).toBe(true);
  });

  it('casa wify com wifi', () => {
    expect(matcher.matches(normalizer.normalize('wify'), 'wifi')).toBe(true);
  });

  it('não confunde goovi com golpi (fuzzy curto demais)', () => {
    expect(matcher.matches(normalizer.normalize('goovi'), 'golpi')).toBe(false);
  });

  it('não aplica fuzzy em pix curto contra pai', () => {
    expect(matcher.matches(normalizer.normalize('pai'), 'pix')).toBe(false);
  });

  it('casa token curto só por igualdade', () => {
    expect(matcher.matches(normalizer.normalize('fazer um pix'), 'pix')).toBe(true);
  });

  it('levenshtein básico', () => {
    expect(levenshtein('wifi', 'wifi')).toBe(0);
    expect(levenshtein('uifi', 'wifi')).toBe(1);
  });
});
