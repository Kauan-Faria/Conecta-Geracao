import { SendInternalCampaignUseCase } from './send-internal-campaign.use-case';
import { CampaignSegment } from '../../domain/value-objects/campaign-segment.vo';
import { Campaign } from '../../domain/entities/campaign.entity';
import { SendResults } from '../ports/push-notification.provider';

describe('SendInternalCampaignUseCase', () => {
  const segment = CampaignSegment.create({ type: 'all_active' });

  it('retorna campanha existente quando idempotencyKey duplicada no mesmo dia', async () => {
    const existing = Campaign.reconstitute({
      id: 'camp-1',
      title: 'T',
      body: 'B',
      deepLink: '/',
      segmentType: 'all_active',
      status: 'completed',
      requestedBy: 'internal-service',
      sentCount: 5,
      skippedCount: 1,
      idempotencyKey: 'dup-key',
    });

    const useCase = new SendInternalCampaignUseCase(
      { save: jest.fn() } as never,
      { findExisting: jest.fn().mockResolvedValue(existing) } as never,
      { resolveRecipients: jest.fn() } as never,
      { execute: jest.fn() } as never,
    );

    const result = await useCase.execute({
      title: 'Nova',
      body: 'Corpo',
      deepLink: '/',
      segment,
      idempotencyKey: 'dup-key',
    });

    expect(result.idempotentReplay).toBe(true);
    expect(result.campaign.id).toBe('camp-1');
  });

  it('processa campanha e atualiza contadores', async () => {
    const campaigns = {
      save: jest
        .fn()
        .mockImplementation(async (c: Campaign) =>
          Campaign.reconstitute({ ...c, id: c.id ?? 'camp-new' } as never),
        ),
      findByIdempotencyKey: jest.fn(),
    };

    const sendPush = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(SendResults.sent(['m1']))
        .mockResolvedValueOnce(SendResults.skipped('no_active_tokens')),
    };

    const useCase = new SendInternalCampaignUseCase(
      campaigns as never,
      { findExisting: jest.fn().mockResolvedValue(null) } as never,
      { resolveRecipients: jest.fn().mockResolvedValue(['u1', 'u2']) } as never,
      sendPush as never,
    );

    const result = await useCase.execute({
      title: 'Campanha',
      body: 'Corpo genérico',
      deepLink: '/',
      segment,
    });

    expect(result.idempotentReplay).toBe(false);
    expect(result.campaign.sentCount).toBe(1);
    expect(result.campaign.skippedCount).toBe(1);
    expect(sendPush.execute).toHaveBeenCalledTimes(2);
  });
});
