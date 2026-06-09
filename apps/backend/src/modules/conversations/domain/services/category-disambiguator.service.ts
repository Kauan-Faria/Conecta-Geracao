import {
  PoiCategory,
  PoiCategoryValue,
} from '../../../maps/domain/value-objects/poi-category.vo';

export const HEALTH_CLARIFICATION_QUESTION =
  'Você precisa de um posto de saúde (UBS) ou de um hospital/UPA?';

export const MULTIPLE_CATEGORY_CLARIFICATION_QUESTION =
  'Vi que você mencionou mais de um tipo de lugar. Qual você quer buscar primeiro?';

export type CategoryResolution =
  | { type: 'resolved'; category: PoiCategory }
  | { type: 'clarification'; question: string }
  | { type: 'none' };

const CATEGORY_PATTERNS: Array<{ category: PoiCategoryValue; patterns: RegExp[] }> = [
  {
    category: 'pharmacy',
    patterns: [/\bfarm[aá]cia\b/, /\brem[eé]dio\b/, /\bdrogaria\b/],
  },
  {
    category: 'health_post',
    patterns: [/\bubs\b/, /\bposto de sa[uú]de\b/, /\bunidade b[aá]sica\b/],
  },
  {
    category: 'hospital',
    patterns: [/\bhospital\b/, /\bupa\b/, /\bemerg[eê]ncia\b/],
  },
  {
    category: 'bank',
    patterns: [/\bbanco\b/, /\bcaixa eletr[oô]nico\b/, /\bc[aá]mbio\b/],
  },
  {
    category: 'post_office',
    patterns: [/\bcorreios\b/, /\bag[eê]ncia dos correios\b/],
  },
  {
    category: 'supermarket',
    patterns: [/\bsupermercado\b/, /\bmercado\b/, /\bhipermercado\b/],
  },
];

const HEALTH_AMBIGUOUS_PATTERN =
  /\b(sa[uú]de|posto de sa[uú]de|unidade de sa[uú]de|atendimento de sa[uú]de)\b/;

export class CategoryDisambiguator {
  resolve(message: string, messageHistory: { role: string; content: string }[]): CategoryResolution {
    const normalized = message.toLowerCase();
    const healthFollowUp = this.resolveHealthFollowUp(normalized, messageHistory);
    if (healthFollowUp) {
      return { type: 'resolved', category: PoiCategory.create(healthFollowUp) };
    }

    const matched = CATEGORY_PATTERNS.filter(({ patterns }) =>
      patterns.some((p) => p.test(normalized)),
    );

    if (matched.length > 1) {
      return { type: 'clarification', question: MULTIPLE_CATEGORY_CLARIFICATION_QUESTION };
    }

    if (matched.length === 1) {
      return { type: 'resolved', category: PoiCategory.create(matched[0].category) };
    }

    if (HEALTH_AMBIGUOUS_PATTERN.test(normalized)) {
      return { type: 'clarification', question: HEALTH_CLARIFICATION_QUESTION };
    }

    return { type: 'none' };
  }

  private resolveHealthFollowUp(
    normalized: string,
    messageHistory: { role: string; content: string }[],
  ): PoiCategoryValue | null {
    const lastAssistant = [...messageHistory].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant?.content.includes('UBS') || !lastAssistant.content.includes('hospital')) {
      return null;
    }

    if (/\b(ubs|posto de sa[uú]de|unidade b[aá]sica)\b/.test(normalized)) {
      return 'health_post';
    }
    if (/\b(hospital|upa|emerg[eê]ncia)\b/.test(normalized)) {
      return 'hospital';
    }
    return null;
  }
}
