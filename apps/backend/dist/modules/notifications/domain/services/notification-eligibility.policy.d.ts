import { DeviceTokenRepository } from '../../application/ports/device-token.repository';
import { NotificationPreferenceRepository } from '../../application/ports/notification-preference.repository';
export type EligibilityResult = {
    eligible: true;
} | {
    eligible: false;
    reason: 'preference_disabled' | 'no_active_tokens';
};
export declare class NotificationEligibilityPolicy {
    private readonly preferences;
    private readonly deviceTokens;
    constructor(preferences: NotificationPreferenceRepository, deviceTokens: DeviceTokenRepository);
    canSend(firebaseUid: string): Promise<EligibilityResult>;
}
