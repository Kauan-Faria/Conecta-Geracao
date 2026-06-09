import { RadiusSuggestionPolicy } from './radius-suggestion.policy';

describe('RadiusSuggestionPolicy', () => {
  const policy = new RadiusSuggestionPolicy();

  it('usa 5 km como padrão', () => {
    expect(policy.suggest('farmácia perto').kilometers).toBe(5);
  });

  it('usa 2 km para "bem perto"', () => {
    expect(policy.suggest('farmácia bem perto').kilometers).toBe(2);
  });

  it('usa 5 km para "perto de mim"', () => {
    expect(policy.suggest('banco perto de mim').kilometers).toBe(5);
  });

  it('usa 10 km para "mais longe"', () => {
    expect(policy.suggest('supermercado mais longe').kilometers).toBe(10);
  });
});
