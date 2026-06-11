import { Injectable, Logger } from '@nestjs/common';
import { NotificationAnalyticsPort } from '../../application/ports/notification-analytics.port';
import { NotificationSentEvent } from '../../domain/value-objects/notification-sent-event.vo';

@Injectable()
export class PinoNotificationAnalyticsAdapter implements NotificationAnalyticsPort {
  private readonly logger = new Logger(PinoNotificationAnalyticsAdapter.name);

  async trackNotificationSent(event: NotificationSentEvent): Promise<void> {
    this.logger.log(event.toLogPayload());
  }
}
