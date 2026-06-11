import { AuthenticatedUser } from '../../../shared/auth/current-user.decorator';
import { RegisterDeviceTokenUseCase } from '../application/use-cases/register-device-token.use-case';
import { UpdateNotificationPreferenceUseCase } from '../application/use-cases/update-notification-preference.use-case';
import { DeactivateDeviceTokenUseCase } from '../application/use-cases/deactivate-device-token.use-case';
import { GetNotificationPreferenceUseCase } from '../application/use-cases/get-notification-preference.use-case';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { DeactivateDeviceTokenDto } from './dto/deactivate-device-token.dto';
export declare class NotificationsController {
    private readonly registerDeviceToken;
    private readonly updateNotificationPreference;
    private readonly deactivateDeviceToken;
    private readonly getNotificationPreference;
    constructor(registerDeviceToken: RegisterDeviceTokenUseCase, updateNotificationPreference: UpdateNotificationPreferenceUseCase, deactivateDeviceToken: DeactivateDeviceTokenUseCase, getNotificationPreference: GetNotificationPreferenceUseCase);
    putDeviceToken(user: AuthenticatedUser, dto: RegisterDeviceTokenDto): Promise<import("./mappers/notifications.mapper").DeviceTokenDto>;
    deleteDeviceToken(user: AuthenticatedUser, dto: DeactivateDeviceTokenDto): Promise<void>;
    getPreferences(user: AuthenticatedUser): Promise<import("./mappers/notifications.mapper").NotificationPreferenceDto>;
    putPreferences(user: AuthenticatedUser, dto: UpdateNotificationPreferenceDto): Promise<import("./mappers/notifications.mapper").NotificationPreferenceDto>;
    private mapDomainError;
}
