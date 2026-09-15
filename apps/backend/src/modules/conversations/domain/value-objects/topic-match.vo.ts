export type MatchConfidence = 'high' | 'low' | 'tie' | 'none';

export interface TopicCandidateScore {
  slug: string;
  score: number;
  matchedTerms: string[];
}

export class TopicMatch {
  private constructor(
    readonly confidence: MatchConfidence,
    readonly slug: string | null,
    readonly candidates: TopicCandidateScore[],
  ) {}

  static high(slug: string, candidates: TopicCandidateScore[]): TopicMatch {
    return new TopicMatch('high', slug, candidates);
  }

  static tie(candidates: TopicCandidateScore[]): TopicMatch {
    return new TopicMatch('tie', null, candidates);
  }

  static low(candidates: TopicCandidateScore[]): TopicMatch {
    return new TopicMatch('low', null, candidates);
  }

  static none(): TopicMatch {
    return new TopicMatch('none', null, []);
  }

  get isHigh(): boolean {
    return this.confidence === 'high' && this.slug !== null;
  }
}
