import { NormalizedQuery, QueryNormalizer } from './query-normalizer';

export class FuzzyTokenMatcher {
  private readonly normalizer = new QueryNormalizer();

  matches(query: NormalizedQuery, term: string): boolean {
    const target = this.normalizer.normalize(term);
    if (!target.normalized) {
      return false;
    }

    if (query.normalized.includes(target.normalized)) {
      return true;
    }

    if (target.compact.length >= 4 && query.compact.includes(target.compact)) {
      return true;
    }

    if (query.tokens.some((token) => token === target.normalized || token === target.compact)) {
      return true;
    }

    if (target.compact.length < 4) {
      return false;
    }

    const maxDistance = target.compact.length >= 7 ? 2 : 1;
    return query.tokens.some((token) => {
      if (token.length < 3) {
        return false;
      }
      return levenshtein(token, target.compact) <= maxDistance;
    });
  }
}

export function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}
