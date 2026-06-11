import { Inject, Injectable, Logger } from '@nestjs/common';
import { ok, err, Result } from '../../../../shared/result';
import { DomainError } from '../../domain/errors/domain.errors';
import { FcmToken } from '../../domain/value-objects/fcm-token.vo';
import { FirebaseUid } from '../../domain/value-objects/firebase-uid.vo';
import {
  DEVICE_TOKEN_REPOSITORY,
  DeviceTokenRepository,
} from '../ports/device-token.repository';

@Injectable()
export class DeactivateDeviceTokenUseCase {
  private readonly logger = new Logger(DeactivateDeviceTokenUseCase.name);

  constructor(
    @Inject(DEVICE_TOKEN_REPOSITORY)
    private readonly deviceTokens: DeviceTokenRepository,
  ) {}

  async execute(
    firebaseUid: string,
    token: string,
  ): Promise<Result<void, DomainError>> {
    try {
      FirebaseUid.create(firebaseUid);
      FcmToken.create(token);
      await this.deviceTokens.deactivateByFirebaseUidAndToken(firebaseUid, token);

      this.logger.log({
        event: 'DeviceTokenDeactivated',
        firebaseUid,
        tokenPrefix: `${token.slice(0, 8)}...`,
      });

      return ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) {
        return err(error);
      }
      throw error;
    }
  }
}
