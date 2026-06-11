import { DevicePlatform } from '../value-objects/device-platform.vo';
import { FcmToken } from '../value-objects/fcm-token.vo';
import { FirebaseUid } from '../value-objects/firebase-uid.vo';

export interface DeviceTokenProps {
  id?: string;
  firebaseUid: string;
  token: FcmToken;
  platform: DevicePlatform;
  isActive?: boolean;
  lastSeenAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DeviceToken {
  readonly id?: string;
  readonly firebaseUid: string;
  readonly token: FcmToken;
  readonly platform: DevicePlatform;
  readonly isActive: boolean;
  readonly lastSeenAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: {
    id?: string;
    firebaseUid: string;
    token: FcmToken;
    platform: DevicePlatform;
    isActive: boolean;
    lastSeenAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.firebaseUid = props.firebaseUid;
    this.token = props.token;
    this.platform = props.platform;
    this.isActive = props.isActive;
    this.lastSeenAt = props.lastSeenAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static register(props: {
    firebaseUid: string;
    token: string;
    platform: string;
  }): DeviceToken {
    const uid = FirebaseUid.create(props.firebaseUid);
    const token = FcmToken.create(props.token);
    const platform = DevicePlatform.create(props.platform);
    const now = new Date();

    return new DeviceToken({
      firebaseUid: uid.value,
      token,
      platform,
      isActive: true,
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: DeviceTokenProps): DeviceToken {
    return new DeviceToken({
      id: props.id,
      firebaseUid: props.firebaseUid,
      token: props.token,
      platform: props.platform,
      isActive: props.isActive ?? true,
      lastSeenAt: props.lastSeenAt ?? new Date(),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  refreshLastSeen(): DeviceToken {
    const now = new Date();
    return new DeviceToken({
      id: this.id,
      firebaseUid: this.firebaseUid,
      token: this.token,
      platform: this.platform,
      isActive: true,
      lastSeenAt: now,
      createdAt: this.createdAt,
      updatedAt: now,
    });
  }

  deactivate(): DeviceToken {
    return new DeviceToken({
      id: this.id,
      firebaseUid: this.firebaseUid,
      token: this.token,
      platform: this.platform,
      isActive: false,
      lastSeenAt: this.lastSeenAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
