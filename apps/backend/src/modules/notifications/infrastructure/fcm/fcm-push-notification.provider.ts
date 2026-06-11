import { Inject, Injectable, Logger } from '@nestjs/common';
import type { App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { FIREBASE_ADMIN } from '../../../../shared/auth/firebase-admin.provider';
import {
  DEVICE_TOKEN_REPOSITORY,
  DeviceTokenRepository,
} from '../../application/ports/device-token.repository';
import {
  PushNotificationProvider,
  SendResult,
  SendResults,
} from '../../application/ports/push-notification.provider';
import { PushNotification } from '../../domain/value-objects/push-notification.vo';
import {
  FCM_PERMANENT_ERROR_CODES,
  FCM_RETRYABLE_ERROR_CODES,
  FCM_RETRY_DELAYS_MS,
  sleep,
  truncateToken,
} from './fcm.constants';

@Injectable()
export class FcmPushNotificationProvider implements PushNotificationProvider {
  private readonly logger = new Logger(FcmPushNotificationProvider.name);

  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: App,
    @Inject(DEVICE_TOKEN_REPOSITORY)
    private readonly deviceTokens: DeviceTokenRepository,
  ) {}

  async send(firebaseUid: string, notification: PushNotification): Promise<SendResult> {
    const tokens = await this.deviceTokens.findActiveByFirebaseUid(firebaseUid);
    if (tokens.length === 0) {
      return SendResults.skipped('no_active_tokens');
    }

    const messaging = getMessaging(this.firebaseApp);
    const messageIds: string[] = [];
    let failures = 0;

    for (const deviceToken of tokens) {
      if (!deviceToken.id) {
        continue;
      }

      const payload = {
        token: deviceToken.token.value,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          type: notification.type.value,
          route: notification.deepLink,
          ...(notification.conversationId
            ? { conversationId: notification.conversationId }
            : {}),
        },
      };

      try {
        const messageId = await this.sendWithRetry(messaging, payload);
        messageIds.push(messageId);
      } catch (error) {
        failures += 1;
        const code = this.extractErrorCode(error);
        this.logger.warn({
          event: 'FcmSendFailed',
          firebaseUid,
          deviceTokenId: deviceToken.id,
          token: truncateToken(deviceToken.token.value),
          code,
        });

        if (code && FCM_PERMANENT_ERROR_CODES.has(code) && deviceToken.id) {
          await this.deviceTokens.deactivateById(deviceToken.id);
          this.logger.log({
            event: 'DeviceTokenDeactivatedByFcm',
            firebaseUid,
            deviceTokenId: deviceToken.id,
            fcmErrorCode: code,
          });
        }
      }
    }

    if (messageIds.length === 0) {
      return SendResults.failed('FCM send failed for all tokens');
    }

    if (failures > 0) {
      return SendResults.partial(messageIds, `${failures} token(s) failed`);
    }

    return SendResults.sent(messageIds);
  }

  private async sendWithRetry(
    messaging: ReturnType<typeof getMessaging>,
    payload: {
      token: string;
      notification: { title: string; body: string };
      data: Record<string, string>;
    },
  ): Promise<string> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= FCM_RETRY_DELAYS_MS.length; attempt += 1) {
      try {
        return await messaging.send(payload);
      } catch (error) {
        lastError = error;
        const code = this.extractErrorCode(error);
        if (!code || !FCM_RETRYABLE_ERROR_CODES.has(code) || attempt === FCM_RETRY_DELAYS_MS.length) {
          throw error;
        }
        await sleep(FCM_RETRY_DELAYS_MS[attempt]!);
      }
    }

    throw lastError;
  }

  private extractErrorCode(error: unknown): string | undefined {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      return String((error as { code: string }).code);
    }
    return undefined;
  }
}
