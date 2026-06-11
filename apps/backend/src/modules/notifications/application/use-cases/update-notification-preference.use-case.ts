import { Inject, Injectable, Logger } from '@nestjs/common';
import { ok, err, Result } from '../../../../shared/result';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { FirebaseUid } from '../../domain/value-objects/firebase-uid.vo';
import {
  NOTIFICATION_PREFERENCE_REPOSITORY,
  NotificationPreferenceRepository,
} from '../ports/notification-preference.repository';

@Injectable()
export class UpdateNotificationPreferenceUseCase {
  private readonly logger = new Logger(UpdateNotificationPreferenceUseCase.name);

  constructor(
    @Inject(NOTIFICATION_PREFERENCE_REPOSITORY)
    private readonly preferences: NotificationPreferenceRepository,
  ) {}

  async execute(
    firebaseUid: string,
    enabled: boolean,
  ): Promise<Result<NotificationPreference, DomainError>> {
    try {
      FirebaseUid.create(firebaseUid);
      const existing = await this.preferences.findByFirebaseUid(firebaseUid);
      const base = existing ?? NotificationPreference.createDefault(firebaseUid);
      const updated = base.updateEnabled(enabled);
      const saved = await this.preferences.upsert(updated);

      this.logger.log({
        event: 'NotificationPreferenceUpdated',
        firebaseUid,
        enabled,
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
