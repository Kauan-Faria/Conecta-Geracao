import { CategoryDisambiguator, HEALTH_CLARIFICATION_QUESTION } from './category-disambiguator.service';

describe('CategoryDisambiguator', () => {
  const disambiguator = new CategoryDisambiguator();

  it('resolve farmácia diretamente', () => {
    const result = disambiguator.resolve('qual farmácia mais próxima?', []);
    expect(result.type).toBe('resolved');
    if (result.type === 'resolved') {
      expect(result.category.value).toBe('pharmacy');
    }
  });

  it('pede clarificação para saúde ambígua', () => {
    const result = disambiguator.resolve('preciso de saúde perto', []);
    expect(result.type).toBe('clarification');
    if (result.type === 'clarification') {
      expect(result.question).toBe(HEALTH_CLARIFICATION_QUESTION);
    }
  });

  it('resolve UBS após clarificação de saúde', () => {
    const history = [
      {
        role: 'assistant',
        content: 'Você precisa de um posto de saúde (UBS) ou de um hospital/UPA?',
      },
    ];
    const result = disambiguator.resolve('preciso de UBS', history);
    expect(result.type).toBe('resolved');
    if (result.type === 'resolved') {
      expect(result.category.value).toBe('health_post');
    }
  });
});
