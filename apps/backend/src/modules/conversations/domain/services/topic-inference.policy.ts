import { QueryNormalizer } from './query-normalizer';
import { KeywordScoringPolicy, ScorableTopic } from './keyword-scoring.policy';
import { TopicMatch } from '../value-objects/topic-match.vo';

export interface TopicCandidate extends ScorableTopic {
  slug: string;
  keywords: string[];
  aliases?: string[];
}

/** Piso para high/tie (ADR-014). Genérico sozinho (0.5) fica em low. */
export const HIGH_SCORE_FLOOR = 2;
/** Margem mínima entre 1º e 2º para não empatar (ADR-014). */
export const TIE_MARGIN = 2;

export class TopicInferencePolicy {
  private readonly normalizer = new QueryNormalizer();
  private readonly scoring = new KeywordScoringPolicy();

  infer(userMessage: string, topics: TopicCandidate[]): TopicMatch {
    const query = this.normalizer.normalize(userMessage);
    if (query.tokens.length === 0) {
      return TopicMatch.none();
    }

    const ranked = topics
      .map((topic) => this.scoring.score(topic, query))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const second = ranked[1];
    const bestScore = best?.score ?? 0;
    const secondScore = second?.score ?? 0;

    if (bestScore <= 0) {
      return TopicMatch.none();
    }

    if (bestScore < HIGH_SCORE_FLOOR) {
      return TopicMatch.low(ranked);
    }

    if (bestScore - secondScore < TIE_MARGIN) {
      return TopicMatch.tie(ranked);
    }

    return TopicMatch.high(best.slug, ranked);
  }

  /** Compatível com o matcher antigo: slug só quando a confiança é high. */
  inferSlug(userMessage: string, topics: TopicCandidate[]): string | null {
    return this.infer(userMessage, topics).slug;
  }
}
