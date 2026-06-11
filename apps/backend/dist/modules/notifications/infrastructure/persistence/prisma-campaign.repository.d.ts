import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { CampaignRepository } from '../../application/ports/campaign.repository';
import { Campaign } from '../../domain/entities/campaign.entity';
export declare class PrismaCampaignRepository implements CampaignRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    save(campaign: Campaign): Promise<Campaign>;
    findByIdempotencyKey(key: string, date: Date): Promise<Campaign | null>;
    private toEntity;
}
