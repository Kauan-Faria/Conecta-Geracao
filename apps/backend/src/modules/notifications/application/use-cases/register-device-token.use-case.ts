import { Inject, Injectable, Logger } from '@nestjs/common';
import { ok, err, Result } from '../../../../shared/result';
import { DeviceToken } from '../../domain/entities/device-token.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import {
  DEVICE_TOKEN_REPOSITORY,
  DeviceTokenRepository,
} from '../ports/device-token.repository';
import {
  NOTIFICATION_PREFERENCE_REPOSITORY,
  NotificationPreferenceRepository,
} from '../ports/notification-preference.repository';

@Injectable()
export class RegisterDeviceTokenUseCase {
  private readonly logger = new Logger(RegisterDeviceTokenUseCase.name);

  constructor(
    @Inject(DEVICE_TOKEN_REPOSITORY)
    private readonly deviceTokens: DeviceTokenRepository,
    @Inject(NOTIFICATION_PREFERENCE_REPOSITORY)
    private readonly preferences: NotificationPreferenceRepository,
  ) {}

  async execute(
    firebaseUid: string,
    token: string,
    platform: string,
  ): Promise<Result<DeviceToken, DomainError>> {
    try {
      const deviceToken = DeviceToken.register({ firebaseUid, token, platform });
      const saved = await this.deviceTokens.upsert(deviceToken);
      await this.preferences.getOrCreateDefault(firebaseUid);

      this.logger.log({
        event: 'DeviceTokenRegistered',
        firebaseUid,
        deviceTokenId: saved.id,
        platform: saved.platform.value,
      });

      return ok(saved);
    } catch (error) {
      if (error instanceof DomainError) {
        return err(error);
      }
      throw error;
    }
  }
}
