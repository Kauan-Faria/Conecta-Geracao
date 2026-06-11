import { NotificationPreference } from '../../domain/entities/notification-preference.entity';

export const NOTIFICATION_PREFERENCE_REPOSITORY = Symbol(
  'NOTIFICATION_PREFERENCE_REPOSITORY',
);

export interface NotificationPreferenceRepository {
  findByFirebaseUid(firebaseUid: string): Promise<NotificationPreference | null>;
  upsert(preference: NotificationPreference): Promise<NotificationPreference>;
  getOrCreateDefault(firebaseUid: string): Promise<NotificationPreference>;
}
