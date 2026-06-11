import { NotificationTypeValue } from '../value-objects/notification-type.vo';

export type DeliveryLogStatus = 'sent' | 'skipped';

export interface NotificationDeliveryLogProps {
  id?: string;
  firebaseUid: string;
  conversationId?: string | null;
  notificationType: NotificationTypeValue;
  status: DeliveryLogStatus;
  fcmMessageId?: string | null;
  skippedReason?: string | null;
  sentAt?: Date;
}

export class NotificationDeliveryLog {
  readonly id?: string;
  readonly firebaseUid: string;
  readonly conversationId: string | null;
  readonly notificationType: NotificationTypeValue;
  readonly status: DeliveryLogStatus;
  readonly fcmMessageId: string | null;
  readonly skippedReason: string | null;
  readonly sentAt: Date;

  private constructor(props: {
    id?: string;
    firebaseUid: string;
    conversationId: string | null;
    notificationType: NotificationTypeValue;
    status: DeliveryLogStatus;
    fcmMessageId: string | null;
    skippedReason: string | null;
    sentAt: Date;
  }) {
    this.id = props.id;
    this.firebaseUid = props.firebaseUid;
    this.conversationId = props.conversationId;
    this.notificationType = props.notificationType;
    this.status = props.status;
    this.fcmMessageId = props.fcmMessageId;
    this.skippedReason = props.skippedReason;
    this.sentAt = props.sentAt;
  }

  static createSent(props: {
    firebaseUid: string;
    conversationId?: string | null;
    notificationType: NotificationTypeValue;
    fcmMessageId?: string | null;
  }): NotificationDeliveryLog {
    return new NotificationDeliveryLog({
      firebaseUid: props.firebaseUid,
      conversationId: props.conversationId ?? null,
      notificationType: props.notificationType,
      status: 'sent',
      fcmMessageId: props.fcmMessageId ?? null,
      skippedReason: null,
      sentAt: new Date(),
    });
  }

  static createSkipped(props: {
    firebaseUid: string;
    conversationId?: string | null;
    notificationType: NotificationTypeValue;
    skippedReason: string;
  }): NotificationDeliveryLog {
    return new NotificationDeliveryLog({
      firebaseUid: props.firebaseUid,
      conversationId: props.conversationId ?? null,
      notificationType: props.notificationType,
      status: 'skipped',
      fcmMessageId: null,
      skippedReason: props.skippedReason,
      sentAt: new Date(),
    });
  }

  static reconstitute(props: NotificationDeliveryLogProps): NotificationDeliveryLog {
    return new NotificationDeliveryLog({
      id: props.id,
      firebaseUid: props.firebaseUid,
      conversationId: props.conversationId ?? null,
      notificationType: props.notificationType,
      status: props.status,
      fcmMessageId: props.fcmMessageId ?? null,
      skippedReason: props.skippedReason ?? null,
      sentAt: props.sentAt ?? new Date(),
    });
  }
}
