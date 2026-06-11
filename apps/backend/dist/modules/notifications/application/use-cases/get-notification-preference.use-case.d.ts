import { Result } from '../../../../shared/result';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { NotificationPreferenceRepository } from '../ports/notification-preference.repository';
export declare class GetNotificationPreferenceUseCase {
    private readonly preferences;
    constructor(preferences: NotificationPreferenceRepository);
    execute(firebaseUid: string): Promise<Result<NotificationPreference, DomainError>>;
}
