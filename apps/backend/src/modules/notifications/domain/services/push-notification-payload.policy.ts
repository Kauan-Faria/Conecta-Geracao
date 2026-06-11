import { Injectable } from '@nestjs/common';
import { PushNotification } from '../value-objects/push-notification.vo';

@Injectable()
export class PushNotificationPayloadPolicy {
  assertSafePayload(notification: PushNotification): void {
    // Validação centralizada no VO PushNotification.create; este serviço
    // existe como ponto de extensão para regras adicionais no bolt 017.
    if (!notification.title || !notification.body || !notification.deepLink) {
      throw new Error('Payload de notificação incompleto.');
    }
  }
}
