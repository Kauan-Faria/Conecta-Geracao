import { TopicMatch } from '../value-objects/topic-match.vo';

export interface ClarificationOption {
  slug: string;
  title: string;
}

export interface ClarificationQuestion {
  text: string;
  options: ClarificationOption[];
}

export interface TopicTitleCatalog {
  slug: string;
  title: string;
}

const OPEN_QUESTION = 'O que você está tentando fazer agora?';

export class ClarificationQuestionPolicy {
  compose(match: TopicMatch, catalog: TopicTitleCatalog[]): ClarificationQuestion {
    const titles = new Map(catalog.map((topic) => [topic.slug, topic.title]));
    const ranked = match.candidates.filter((candidate) => candidate.score > 0);
    const uniqueSlugs = [...new Set(ranked.map((candidate) => candidate.slug))];
    const options = uniqueSlugs.slice(0, 2).flatMap((slug) => {
      const title = titles.get(slug);
      return title ? [{ slug, title }] : [];
    });

    if (match.confidence === 'tie' && options.length === 2) {
      return {
        text: `Você quer ajuda com ${options[0].title} ou com ${options[1].title}?`,
        options,
      };
    }

    if (match.confidence === 'low' && options.length === 1) {
      return {
        text: `É sobre ${options[0].title}? Se não for, me conta o que você precisa.`,
        options,
      };
    }

    return { text: OPEN_QUESTION, options: [] };
  }
}
