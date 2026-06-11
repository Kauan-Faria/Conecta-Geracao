import { ReminderCooldownPolicy } from './reminder-cooldown.policy';

describe('ReminderCooldownPolicy', () => {
  it('permite envio quando não há lembrete recente', async () => {
    const policy = new ReminderCooldownPolicy({
      existsSentWithin: jest.fn().mockResolvedValue(false),
    } as never);

    await expect(policy.canSendReminder('conv-1')).resolves.toBe(true);
  });

  it('bloqueia envio quando cooldown ativo', async () => {
    const policy = new ReminderCooldownPolicy({
      existsSentWithin: jest.fn().mockResolvedValue(true),
    } as never);

    await expect(policy.canSendReminder('conv-1')).resolves.toBe(false);
  });
});
