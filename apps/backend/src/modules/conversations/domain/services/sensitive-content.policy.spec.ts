import { SensitiveContentPolicy } from './sensitive-content.policy';

describe('SensitiveContentPolicy', () => {
  const policy = new SensitiveContentPolicy();

  it('detecta menção a senha no input', () => {
    expect(policy.containsSensitiveInput('minha senha é 1234')).toBe(true);
  });

  it('detecta OTP no input', () => {
    expect(policy.containsSensitiveInput('o OTP que recebi')).toBe(true);
  });

  it('não bloqueia pedido de ajuda com senha do Wi-Fi', () => {
    expect(policy.containsSensitiveInput('como passo a senha do wi-fi')).toBe(false);
  });

  it('mascara números longos em logs', () => {
    expect(policy.sanitizeForLog('código 12345678')).toContain('****');
  });

  it('detecta pedido de senha na saída', () => {
    expect(policy.containsUnsafeOutput('Digite sua senha no chat')).toBe(true);
  });
});
