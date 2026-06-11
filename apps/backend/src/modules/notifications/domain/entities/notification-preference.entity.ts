import { FirebaseUid } from '../value-objects/firebase-uid.vo';

export interface NotificationPreferenceProps {
  firebaseUid: string;
  enabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NotificationPreference {
  readonly firebaseUid: string;
  readonly enabled: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: {
    firebaseUid: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.firebaseUid = props.firebaseUid;
    this.enabled = props.enabled;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static createDefault(firebaseUid: string): NotificationPreference {
    const uid = FirebaseUid.create(firebaseUid);
    const now = new Date();
    return new NotificationPreference({
      firebaseUid: uid.value,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: NotificationPreferenceProps): NotificationPreference {
    return new NotificationPreference({
      firebaseUid: props.firebaseUid,
      enabled: props.enabled ?? true,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  updateEnabled(enabled: boolean): NotificationPreference {
    return new NotificationPreference({
      firebaseUid: this.firebaseUid,
      enabled,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
