import { Inject, Injectable } from '@nestjs/common';
import { getTipWeeklyDays } from '../config/notification.config';
import {
  NOTIFICATION_DELIVERY_LOG_REPOSITORY,
  NotificationDeliveryLogRepository,
} from '../../application/ports/notification-delivery-log.repository';

@Injectable()
export class TipWeeklyRateLimitPolicy {
  constructor(
    @Inject(NOTIFICATION_DELIVERY_LOG_REPOSITORY)
    private readonly deliveryLogs: NotificationDeliveryLogRepository,
  ) {}

  async canSendTip(firebaseUid: string): Promise<boolean> {
    const days = getTipWeeklyDays();
    const exists = await this.deliveryLogs.existsUserSentWithin(
      firebaseUid,
      'tip',
      days,
    );
    return !exists;
  }
}
