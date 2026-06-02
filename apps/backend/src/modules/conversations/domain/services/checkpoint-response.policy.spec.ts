import { CheckpointResponsePolicy } from './checkpoint-response.policy';

describe('CheckpointResponsePolicy', () => {
  const policy = new CheckpointResponsePolicy();

  it('avança com resposta afirmativa', () => {
    expect(policy.evaluate('sim')).toBe('advance');
    expect(policy.evaluate('consegui')).toBe('advance');
  });

  it('repete com resposta negativa', () => {
    expect(policy.evaluate('não')).toBe('repeat');
    expect(policy.evaluate('nao consegui')).toBe('repeat');
  });

  it('resolve próximo passo ao avançar', () => {
    expect(policy.resolveNextStep(0, 'advance', 4)).toBe(1);
    expect(policy.resolveNextStep(3, 'advance', 4)).toBe(3);
  });

  it('volta um passo ao repetir', () => {
    expect(policy.resolveNextStep(2, 'repeat', 4)).toBe(1);
  });
});
