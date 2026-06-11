import { Inject, Injectable } from '@nestjs/common';
import { ACTIVE_USER_QUERY, ActiveUserQuery } from '../../application/ports/active-user.query';
import { CampaignSegment } from '../value-objects/campaign-segment.vo';

@Injectable()
export class CampaignEligibilityPolicy {
  constructor(
    @Inject(ACTIVE_USER_QUERY)
    private readonly activeUserQuery: ActiveUserQuery,
  ) {}

  async resolveRecipients(segment: CampaignSegment): Promise<string[]> {
    if (segment.type === 'uid_list' && segment.firebaseUids) {
      const activeSet = new Set(await this.activeUserQuery.findAllWithActiveTokensAndPreference());
      return segment.firebaseUids.filter((uid) => activeSet.has(uid));
    }

    return this.activeUserQuery.findAllWithActiveTokensAndPreference();
  }
}
