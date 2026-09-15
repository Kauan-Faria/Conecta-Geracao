import { KeywordScoringPolicy } from './keyword-scoring.policy';
import { QueryNormalizer } from './query-normalizer';

describe('KeywordScoringPolicy', () => {
  const scoring = new KeywordScoringPolicy();
  const normalizer = new QueryNormalizer();

  const wifi = {
    slug: 'wifi-qr-code',
    keywords: ['wifi', 'qr'],
    aliases: ['wifi', 'qr do wifi'],
  };

  const gov = {
    slug: 'codigo-govbr',
    keywords: ['gov.br', 'codigo', 'governo'],
    aliases: ['govbr', 'codigo do gov'],
  };

  it('alias QR+wifi vence codigo genérico', () => {
    const query = normalizer.normalize('código QR do wifi');
    const wifiScore = scoring.score(wifi, query);
    const govScore = scoring.score(gov, query);
    expect(wifiScore.score).toBeGreaterThan(govScore.score);
    expect(wifiScore.score - govScore.score).toBeGreaterThanOrEqual(2);
  });

  it('codigo sozinho não atinge piso de high', () => {
    const query = normalizer.normalize('código');
    const govScore = scoring.score(gov, query);
    expect(govScore.score).toBeLessThan(2);
  });
});
