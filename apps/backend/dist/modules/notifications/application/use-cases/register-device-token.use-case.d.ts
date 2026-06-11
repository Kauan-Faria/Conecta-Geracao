import { Result } from '../../../../shared/result';
import { DeviceToken } from '../../domain/entities/device-token.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { DeviceTokenRepository } from '../ports/device-token.repository';
import { NotificationPreferenceRepository } from '../ports/notification-preference.repository';
export declare class RegisterDeviceTokenUseCase {
    private readonly deviceTokens;
    private readonly preferences;
    private readonly logger;
    constructor(deviceTokens: DeviceTokenRepository, preferences: NotificationPreferenceRepository);
    execute(firebaseUid: string, token: string, platform: string): Promise<Result<DeviceToken, DomainError>>;
}
