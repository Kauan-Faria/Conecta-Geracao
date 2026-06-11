import { NotificationTypeValue } from './notification-type.vo';

export interface NotificationSentEventProps {
  notificationType: NotificationTypeValue;
  occurredAt: Date;
  campaignId?: string;
  tipId?: string;
}

export class NotificationSentEvent {
  readonly notificationType: NotificationTypeValue;
  readonly occurredAt: Date;
  readonly campaignId?: string;
  readonly tipId?: string;

  private constructor(props: NotificationSentEventProps) {
    this.notificationType = props.notificationType;
    this.occurredAt = props.occurredAt;
    this.campaignId = props.campaignId;
    this.tipId = props.tipId;
  }

  static create(props: NotificationSentEventProps): NotificationSentEvent {
    return new NotificationSentEvent(props);
  }

  toLogPayload(): Record<string, string> {
    const payload: Record<string, string> = {
      event: 'notification_sent',
      notificationType: this.notificationType,
      occurredAt: this.occurredAt.toISOString(),
    };
    if (this.campaignId) payload.campaignId = this.campaignId;
    if (this.tipId) payload.tipId = this.tipId;
    return payload;
  }
}
