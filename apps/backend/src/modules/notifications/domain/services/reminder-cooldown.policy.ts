import { Inject, Injectable } from '@nestjs/common';
import { getReminderCooldownHours } from '../config/notification.config';
import {
  NOTIFICATION_DELIVERY_LOG_REPOSITORY,
  NotificationDeliveryLogRepository,
} from '../../application/ports/notification-delivery-log.repository';

@Injectable()
export class ReminderCooldownPolicy {
  constructor(
    @Inject(NOTIFICATION_DELIVERY_LOG_REPOSITORY)
    private readonly deliveryLogs: NotificationDeliveryLogRepository,
  ) {}

  async canSendReminder(conversationId: string): Promise<boolean> {
    const exists = await this.deliveryLogs.existsSentWithin(
      conversationId,
      'reminder',
      getReminderCooldownHours(),
    );
    return !exists;
  }
}
