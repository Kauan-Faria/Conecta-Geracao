import { InvalidCampaignSegmentError } from '../errors/domain.errors';

export type CampaignSegmentType = 'all_active' | 'uid_list';

export interface CampaignSegmentProps {
  type: CampaignSegmentType;
  firebaseUids?: string[];
}

export class CampaignSegment {
  readonly type: CampaignSegmentType;
  readonly firebaseUids: string[] | null;

  private constructor(type: CampaignSegmentType, firebaseUids: string[] | null) {
    this.type = type;
    this.firebaseUids = firebaseUids;
  }

  static create(props: CampaignSegmentProps): CampaignSegment {
    if (props.type === 'uid_list') {
      const uids = props.firebaseUids?.map((u) => u.trim()).filter(Boolean) ?? [];
      if (uids.length === 0) {
        throw new InvalidCampaignSegmentError(
          'Segmento uid_list exige ao menos um firebaseUid.',
        );
      }
      return new CampaignSegment('uid_list', uids);
    }

    return new CampaignSegment('all_active', null);
  }
}
