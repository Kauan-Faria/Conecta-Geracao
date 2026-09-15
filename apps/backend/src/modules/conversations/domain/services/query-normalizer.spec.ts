import { QueryNormalizer } from './query-normalizer';

describe('QueryNormalizer', () => {
  const normalizer = new QueryNormalizer();

  it.each([
    ['Wi-Fi', 'wifi'],
    ['wifi', 'wifi'],
    ['wi fi', 'wifi'],
    ['WI-FI', 'wifi'],
  ])('compacta %s para wifi', (raw, compact) => {
    const query = normalizer.normalize(raw);
    expect(query.compact).toBe(compact);
  });

  it('remove acentos', () => {
    expect(normalizer.normalize('código').normalized).toBe('codigo');
  });

  it('colapsa pontuação em espaço', () => {
    expect(normalizer.normalize('gov.br').normalized).toBe('gov br');
    expect(normalizer.normalize('gov.br').compact).toBe('govbr');
  });
});
