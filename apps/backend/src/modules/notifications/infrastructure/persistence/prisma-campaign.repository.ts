import { Injectable } from '@nestjs/common';
import {
  CampaignSegmentType as PrismaCampaignSegmentType,
  CampaignStatus as PrismaCampaignStatus,
} from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { CampaignRepository } from '../../application/ports/campaign.repository';
import { Campaign, CampaignSegmentType, CampaignStatus } from '../../domain/entities/campaign.entity';

@Injectable()
export class PrismaCampaignRepository implements CampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(campaign: Campaign): Promise<Campaign> {
    const data = {
      title: campaign.title,
      body: campaign.body,
      deepLink: campaign.deepLink,
      segmentType: campaign.segmentType as PrismaCampaignSegmentType,
      segmentPayload:
        campaign.segmentPayload && campaign.segmentPayload.length > 0
          ? campaign.segmentPayload
          : undefined,
      status: campaign.status as PrismaCampaignStatus,
      requestedBy: campaign.requestedBy,
      requestedAt: campaign.requestedAt,
      completedAt: campaign.completedAt,
      sentCount: campaign.sentCount,
      skippedCount: campaign.skippedCount,
      idempotencyKey: campaign.idempotencyKey,
    };

    const row = campaign.id
      ? await this.prisma.campaign.update({ where: { id: campaign.id }, data })
      : await this.prisma.campaign.create({ data });

    return this.toEntity(row);
  }

  async findByIdempotencyKey(key: string, date: Date): Promise<Campaign | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const row = await this.prisma.campaign.findFirst({
      where: {
        idempotencyKey: key,
        requestedAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (!row) return null;
    return this.toEntity(row);
  }

  private toEntity(row: {
    id: string;
    title: string;
    body: string;
    deepLink: string;
    segmentType: PrismaCampaignSegmentType;
    segmentPayload: unknown;
    status: PrismaCampaignStatus;
    requestedBy: string;
    requestedAt: Date;
    completedAt: Date | null;
    sentCount: number;
    skippedCount: number;
    idempotencyKey: string | null;
  }): Campaign {
    const segmentPayload = Array.isArray(row.segmentPayload)
      ? (row.segmentPayload as string[])
      : null;

    return Campaign.reconstitute({
      id: row.id,
      title: row.title,
      body: row.body,
      deepLink: row.deepLink,
      segmentType: row.segmentType as CampaignSegmentType,
      segmentPayload,
      status: row.status as CampaignStatus,
      requestedBy: row.requestedBy,
      requestedAt: row.requestedAt,
      completedAt: row.completedAt,
      sentCount: row.sentCount,
      skippedCount: row.skippedCount,
      idempotencyKey: row.idempotencyKey,
    });
  }
}
