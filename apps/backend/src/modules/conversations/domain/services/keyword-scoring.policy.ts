import { NormalizedQuery, QueryNormalizer } from './query-normalizer';
import { FuzzyTokenMatcher } from './fuzzy-token-matcher';
import { TopicCandidateScore } from '../value-objects/topic-match.vo';

export interface ScorableTopic {
  slug: string;
  keywords: string[];
  aliases?: string[];
}

export const GENERIC_KEYWORDS = new Set([
  'codigo',
  'cadastro',
  'rede',
  'internet',
  'pagamento',
  'conta',
  'app',
  'site',
]);

const SLUG_WEIGHT = 5;
const ALIAS_WEIGHT = 4;
const SPECIFIC_KEYWORD_WEIGHT = 2;
const GENERIC_KEYWORD_WEIGHT = 0.5;

export class KeywordScoringPolicy {
  private readonly normalizer = new QueryNormalizer();
  private readonly matcher = new FuzzyTokenMatcher();

  score(topic: ScorableTopic, query: NormalizedQuery): TopicCandidateScore {
    let score = 0;
    const matchedTerms: string[] = [];

    const slugAsPhrase = topic.slug.replace(/-/g, ' ');
    const slugCompact = topic.slug.replace(/-/g, '');
    if (this.matcher.matches(query, slugAsPhrase) || this.matcher.matches(query, slugCompact)) {
      score += SLUG_WEIGHT;
      matchedTerms.push(topic.slug);
    }

    for (const alias of topic.aliases ?? []) {
      if (this.matcher.matches(query, alias)) {
        score += ALIAS_WEIGHT;
        matchedTerms.push(alias);
      }
    }

    for (const keyword of topic.keywords) {
      if (!this.matcher.matches(query, keyword)) {
        continue;
      }
      const keywordNorm = this.normalizer.normalize(keyword);
      const isGeneric = keywordNorm.tokens.every((token) => GENERIC_KEYWORDS.has(token));
      score += isGeneric ? GENERIC_KEYWORD_WEIGHT : SPECIFIC_KEYWORD_WEIGHT;
      matchedTerms.push(keyword);
    }

    return { slug: topic.slug, score, matchedTerms };
  }
}
