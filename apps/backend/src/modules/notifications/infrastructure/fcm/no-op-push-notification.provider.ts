import { Injectable, Logger } from '@nestjs/common';
import {
  PushNotificationProvider,
  SendResults,
} from '../../application/ports/push-notification.provider';
import { PushNotification } from '../../domain/value-objects/push-notification.vo';

@Injectable()
export class NoOpPushNotificationProvider implements PushNotificationProvider {
  private readonly logger = new Logger(NoOpPushNotificationProvider.name);

  async send(firebaseUid: string, notification: PushNotification) {
    this.logger.debug({
      event: 'FcmNoOpSkipped',
      firebaseUid,
      notificationType: notification.type.value,
      conversationId: notification.conversationId,
    });
    return SendResults.skipped('fcm_disabled');
  }
}
