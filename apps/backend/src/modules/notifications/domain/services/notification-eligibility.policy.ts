import { Inject, Injectable } from '@nestjs/common';
import {
  DEVICE_TOKEN_REPOSITORY,
  DeviceTokenRepository,
} from '../../application/ports/device-token.repository';
import {
  NOTIFICATION_PREFERENCE_REPOSITORY,
  NotificationPreferenceRepository,
} from '../../application/ports/notification-preference.repository';

export type EligibilityResult =
  | { eligible: true }
  | { eligible: false; reason: 'preference_disabled' | 'no_active_tokens' };

@Injectable()
export class NotificationEligibilityPolicy {
  constructor(
    @Inject(NOTIFICATION_PREFERENCE_REPOSITORY)
    private readonly preferences: NotificationPreferenceRepository,
    @Inject(DEVICE_TOKEN_REPOSITORY)
    private readonly deviceTokens: DeviceTokenRepository,
  ) {}

  async canSend(firebaseUid: string): Promise<EligibilityResult> {
    const preference = await this.preferences.getOrCreateDefault(firebaseUid);
    if (!preference.enabled) {
      return { eligible: false, reason: 'preference_disabled' };
    }

    const tokens = await this.deviceTokens.findActiveByFirebaseUid(firebaseUid);
    if (tokens.length === 0) {
      return { eligible: false, reason: 'no_active_tokens' };
    }

    return { eligible: true };
  }
}
