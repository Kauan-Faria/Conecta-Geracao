import { Inject, Injectable } from '@nestjs/common';
import { ok, err, Result } from '../../../../shared/result';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { FirebaseUid } from '../../domain/value-objects/firebase-uid.vo';
import {
  NOTIFICATION_PREFERENCE_REPOSITORY,
  NotificationPreferenceRepository,
} from '../ports/notification-preference.repository';

@Injectable()
export class GetNotificationPreferenceUseCase {
  constructor(
    @Inject(NOTIFICATION_PREFERENCE_REPOSITORY)
    private readonly preferences: NotificationPreferenceRepository,
  ) {}

  async execute(
    firebaseUid: string,
  ): Promise<Result<NotificationPreference, DomainError>> {
    try {
      FirebaseUid.create(firebaseUid);
      const preference = await this.preferences.getOrCreateDefault(firebaseUid);
      return ok(preference);
    } catch (error) {
      if (error instanceof DomainError) {
        return err(error);
      }
      throw error;
    }
  }
}
