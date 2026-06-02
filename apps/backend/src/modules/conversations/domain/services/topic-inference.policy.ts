export interface TopicCandidate {
  slug: string;
  keywords: string[];
}

export class TopicInferencePolicy {
  inferSlug(userMessage: string, topics: TopicCandidate[]): string | null {
    const normalized = userMessage
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '');

    let bestSlug: string | null = null;
    let bestScore = 0;

    for (const topic of topics) {
      let score = 0;
      if (normalized.includes(topic.slug.replace(/-/g, ' ')) || normalized.includes(topic.slug)) {
        score += 3;
      }
      for (const keyword of topic.keywords) {
        const kw = keyword
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{M}/gu, '');
        if (kw.length >= 3 && normalized.includes(kw)) {
          score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestSlug = topic.slug;
      }
    }

    return bestScore > 0 ? bestSlug : null;
  }
}
