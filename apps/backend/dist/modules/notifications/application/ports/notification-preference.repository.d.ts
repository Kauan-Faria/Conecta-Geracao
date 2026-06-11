import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
export declare const NOTIFICATION_PREFERENCE_REPOSITORY: unique symbol;
export interface NotificationPreferenceRepository {
    findByFirebaseUid(firebaseUid: string): Promise<NotificationPreference | null>;
    upsert(preference: NotificationPreference): Promise<NotificationPreference>;
    getOrCreateDefault(firebaseUid: string): Promise<NotificationPreference>;
}
