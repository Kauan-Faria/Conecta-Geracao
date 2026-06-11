import { Result } from '../../../../shared/result';
import { DomainError } from '../../domain/errors/domain.errors';
import { DeviceTokenRepository } from '../ports/device-token.repository';
export declare class DeactivateDeviceTokenUseCase {
    private readonly deviceTokens;
    private readonly logger;
    constructor(deviceTokens: DeviceTokenRepository);
    execute(firebaseUid: string, token: string): Promise<Result<void, DomainError>>;
}
