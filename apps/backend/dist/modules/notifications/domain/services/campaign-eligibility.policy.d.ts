import { ActiveUserQuery } from '../../application/ports/active-user.query';
import { CampaignSegment } from '../value-objects/campaign-segment.vo';
export declare class CampaignEligibilityPolicy {
    private readonly activeUserQuery;
    constructor(activeUserQuery: ActiveUserQuery);
    resolveRecipients(segment: CampaignSegment): Promise<string[]>;
}
