import { TopicMatch } from '../value-objects/topic-match.vo';
import { TopicSwitchPolicy } from './topic-switch.policy';

describe('TopicSwitchPolicy', () => {
  const policy = new TopicSwitchPolicy();

  it('uifi no tópico Wi-Fi permanece e não zera o passo', () => {
    const decision = policy.decide({
      match: TopicMatch.high('wifi-qr-code', []),
      persisted: 'wifi-qr-code',
      isTutorialCheckpoint: false,
    });
    expect(decision.occurred).toBe(false);
    expect(decision.step).toBe('keep');
  });

  it('troca Gov.br → Wi-Fi zera o passo', () => {
    const decision = policy.decide({
      match: TopicMatch.high('wifi-qr-code', []),
      persisted: 'codigo-govbr',
      isTutorialCheckpoint: false,
    });
    expect(decision.occurred).toBe(true);
    expect(decision.step).toBe('resetToZero');
    expect(decision.toSlug).toBe('wifi-qr-code');
  });

  it('checkpoint de tutorial não troca', () => {
    const decision = policy.decide({
      match: TopicMatch.none(),
      persisted: 'codigo-govbr',
      isTutorialCheckpoint: true,
    });
    expect(decision.occurred).toBe(false);
    expect(decision.toSlug).toBe('codigo-govbr');
  });
});
