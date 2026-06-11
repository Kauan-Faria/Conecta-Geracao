import { Result } from '../../../../shared/result';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { NotificationPreferenceRepository } from '../ports/notification-preference.repository';
export declare class UpdateNotificationPreferenceUseCase {
    private readonly preferences;
    private readonly logger;
    constructor(preferences: NotificationPreferenceRepository);
    execute(firebaseUid: string, enabled: boolean): Promise<Result<NotificationPreference, DomainError>>;
}
