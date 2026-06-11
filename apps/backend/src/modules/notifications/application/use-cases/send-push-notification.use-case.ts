import { Inject, Injectable, Logger } from '@nestjs/common';

import { NotificationDeliveryLog } from '../../domain/entities/notification-delivery-log.entity';

import { DomainError } from '../../domain/errors/domain.errors';

import { NotificationEligibilityPolicy } from '../../domain/services/notification-eligibility.policy';

import { PushNotificationPayloadPolicy } from '../../domain/services/push-notification-payload.policy';

import { ReminderCooldownPolicy } from '../../domain/services/reminder-cooldown.policy';

import { NotificationSentEvent } from '../../domain/value-objects/notification-sent-event.vo';

import { PushNotification } from '../../domain/value-objects/push-notification.vo';

import {

  NOTIFICATION_ANALYTICS_PORT,

  NotificationAnalyticsPort,

} from '../ports/notification-analytics.port';

import {

  NOTIFICATION_DELIVERY_LOG_REPOSITORY,

  NotificationDeliveryLogRepository,

} from '../ports/notification-delivery-log.repository';

import {

  PUSH_NOTIFICATION_PROVIDER,

  PushNotificationProvider,

  SendResult,

  SendResults,

} from '../ports/push-notification.provider';



export interface SendPushOptions {

  campaignId?: string;

  tipId?: string;

}



@Injectable()

export class SendPushNotificationUseCase {

  private readonly logger = new Logger(SendPushNotificationUseCase.name);



  constructor(

    private readonly payloadPolicy: PushNotificationPayloadPolicy,

    private readonly eligibilityPolicy: NotificationEligibilityPolicy,

    private readonly cooldownPolicy: ReminderCooldownPolicy,

    @Inject(PUSH_NOTIFICATION_PROVIDER)

    private readonly pushProvider: PushNotificationProvider,

    @Inject(NOTIFICATION_DELIVERY_LOG_REPOSITORY)

    private readonly deliveryLogs: NotificationDeliveryLogRepository,

    @Inject(NOTIFICATION_ANALYTICS_PORT)

    private readonly analytics: NotificationAnalyticsPort,

  ) {}



  async execute(

    firebaseUid: string,

    notification: PushNotification,

    options?: SendPushOptions,

  ): Promise<SendResult> {

    try {

      this.payloadPolicy.assertSafePayload(notification);

    } catch (error) {

      if (error instanceof DomainError) {

        return this.recordSkip(firebaseUid, notification, 'unsafe_payload');

      }

      throw error;

    }



    const eligibility = await this.eligibilityPolicy.canSend(firebaseUid);

    if (!eligibility.eligible) {

      return this.recordSkip(firebaseUid, notification, eligibility.reason);

    }



    if (

      notification.type.value === 'reminder' &&

      notification.conversationId &&

      !(await this.cooldownPolicy.canSendReminder(notification.conversationId))

    ) {

      return this.recordSkip(firebaseUid, notification, 'cooldown_active');

    }



    const result = await this.pushProvider.send(firebaseUid, notification);

    await this.recordResult(firebaseUid, notification, result);



    if (result.status === 'sent' || result.status === 'partial') {

      this.logger.log({

        event: 'PushNotificationSent',

        firebaseUid,

        notificationType: notification.type.value,

        conversationId: notification.conversationId,

        messageIds: result.messageIds,

      });

      await this.trackAnalytics(notification, options);

    } else if (result.status === 'skipped') {

      this.logger.log({

        event: 'PushNotificationSkipped',

        firebaseUid,

        notificationType: notification.type.value,

        conversationId: notification.conversationId,

        reason: result.skippedReason,

      });

    }



    return result;

  }



  private async trackAnalytics(

    notification: PushNotification,

    options?: SendPushOptions,

  ): Promise<void> {

    try {

      await this.analytics.trackNotificationSent(

        NotificationSentEvent.create({

          notificationType: notification.type.value,

          occurredAt: new Date(),

          campaignId: options?.campaignId,

          tipId: options?.tipId,

        }),

      );

    } catch (error) {

      this.logger.error({

        event: 'NotificationAnalyticsFailed',

        error: error instanceof Error ? error.message : String(error),

      });

    }

  }



  private async recordSkip(

    firebaseUid: string,

    notification: PushNotification,

    reason: SendResult['skippedReason'],

  ): Promise<SendResult> {

    const result = SendResults.skipped(reason!);

    await this.recordResult(firebaseUid, notification, result);

    this.logger.log({

      event: 'PushNotificationSkipped',

      firebaseUid,

      notificationType: notification.type.value,

      conversationId: notification.conversationId,

      reason,

    });

    return result;

  }



  private async recordResult(

    firebaseUid: string,

    notification: PushNotification,

    result: SendResult,

  ): Promise<void> {

    if (!this.shouldPersistDeliveryLog(notification)) {

      return;

    }



    if (result.status === 'skipped') {

      await this.deliveryLogs.save(

        NotificationDeliveryLog.createSkipped({

          firebaseUid,

          conversationId: notification.conversationId,

          notificationType: notification.type.value,

          skippedReason: result.skippedReason ?? 'unknown',

        }),

      );

      return;

    }



    if (result.status === 'sent' || result.status === 'partial') {

      await this.deliveryLogs.save(

        NotificationDeliveryLog.createSent({

          firebaseUid,

          conversationId: notification.conversationId,

          notificationType: notification.type.value,

          fcmMessageId: result.messageIds?.[0] ?? null,

        }),

      );

    }

  }



  private shouldPersistDeliveryLog(notification: PushNotification): boolean {

    if (notification.conversationId) {

      return true;

    }

    return notification.type.value === 'tip' || notification.type.value === 'campaign';

  }

}


