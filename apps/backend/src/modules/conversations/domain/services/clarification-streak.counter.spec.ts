import { ClarificationStreakCounter } from './clarification-streak.counter';

describe('ClarificationStreakCounter', () => {
  const counter = new ClarificationStreakCounter();

  it('histórico vazio é 0', () => {
    expect(counter.count([]).count).toBe(0);
  });

  it('conta clarifys seguidos', () => {
    const streak = counter.count([
      { role: 'user', replyMode: undefined },
      { role: 'assistant', replyMode: 'clarify' },
      { role: 'user' },
      { role: 'assistant', replyMode: 'clarify' },
    ]);
    expect(streak.count).toBe(2);
    expect(streak.isExhausted).toBe(true);
  });

  it('zera após rag', () => {
    const streak = counter.count([
      { role: 'assistant', replyMode: 'clarify' },
      { role: 'user' },
      { role: 'assistant', replyMode: 'rag' },
    ]);
    expect(streak.count).toBe(0);
  });

  it('mensagem antiga sem replyMode não abre loop', () => {
    expect(
      counter.count([{ role: 'assistant' }, { role: 'user' }]).count,
    ).toBe(0);
  });
});
