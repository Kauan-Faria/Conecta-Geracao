import { SendInternalCampaignUseCase } from '../application/use-cases/send-internal-campaign.use-case';
import { InternalCampaignAuthPolicy } from '../domain/services/internal-campaign-auth.policy';
import { SendCampaignDto } from './dto/send-campaign.dto';
export declare class InternalCampaignsController {
    private readonly sendCampaign;
    private readonly authPolicy;
    constructor(sendCampaign: SendInternalCampaignUseCase, authPolicy: InternalCampaignAuthPolicy);
    createCampaign(serviceKey: string | undefined, requestedBy: string | undefined, dto: SendCampaignDto): Promise<import("./mappers/campaigns.mapper").CampaignResponseDto>;
}
