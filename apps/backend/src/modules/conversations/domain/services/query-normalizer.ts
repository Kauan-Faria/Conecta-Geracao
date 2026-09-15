export interface NormalizedQuery {
  readonly raw: string;
  readonly normalized: string;
  readonly compact: string;
  readonly tokens: string[];
}

export class QueryNormalizer {
  normalize(raw: string): NormalizedQuery {
    const normalized = raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/[-_.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const tokens = normalized.length === 0 ? [] : normalized.split(' ').filter(Boolean);
    const compact = tokens.join('');

    return { raw, normalized, compact, tokens };
  }
}
