import { Inject, Injectable, Logger } from '@nestjs/common';
import { getInactivityThresholdHours, getNotificationJobBatchLimit } from '../../domain/config/notification.config';
import { AbandonedConversationPolicy } from '../../domain/services/abandoned-conversation.policy';
import { NotificationEligibilityPolicy } from '../../domain/services/notification-eligibility.policy';
import { ReminderCooldownPolicy } from '../../domain/services/reminder-cooldown.policy';
import {
  ABANDONED_CONVERSATION_QUERY,
  AbandonedConversationQuery,
} from '../ports/abandoned-conversation.query';
import { buildConversationReminder } from '../push-notification.templates';
import { SendPushNotificationUseCase } from './send-push-notification.use-case';

export interface ProcessAbandonedConversationsResult {
  processed: number;
  sent: number;
  skipped: number;
}

@Injectable()
export class ProcessAbandonedConversationsUseCase {
  private readonly logger = new Logger(ProcessAbandonedConversationsUseCase.name);

  constructor(
    @Inject(ABANDONED_CONVERSATION_QUERY)
    private readonly abandonedQuery: AbandonedConversationQuery,
    private readonly abandonedPolicy: AbandonedConversationPolicy,
    private readonly eligibilityPolicy: NotificationEligibilityPolicy,
    private readonly cooldownPolicy: ReminderCooldownPolicy,
    private readonly sendPush: SendPushNotificationUseCase,
  ) {}

  async execute(): Promise<ProcessAbandonedConversationsResult> {
    const thresholdHours = getInactivityThresholdHours();
    const limit = getNotificationJobBatchLimit();
    const snapshots = await this.abandonedQuery.findAbandoned(thresholdHours, limit);

    let sent = 0;
    let skipped = 0;

    for (const snapshot of snapshots) {
      if (!this.abandonedPolicy.isEligible(snapshot)) {
        skipped += 1;
        continue;
      }

      const eligibility = await this.eligibilityPolicy.canSend(snapshot.firebaseUid);
      if (!eligibility.eligible) {
        skipped += 1;
        continue;
      }

      if (!(await this.cooldownPolicy.canSendReminder(snapshot.conversationId))) {
        skipped += 1;
        continue;
      }

      const notification = buildConversationReminder(snapshot.conversationId);
      const result = await this.sendPush.execute(snapshot.firebaseUid, notification);

      if (result.status === 'sent' || result.status === 'partial') {
        sent += 1;
        this.logger.log({
          event: 'ConversationReminderDispatched',
          conversationId: snapshot.conversationId,
          firebaseUid: snapshot.firebaseUid,
          inactivityHours: thresholdHours,
        });
      } else {
        skipped += 1;
      }
    }

    return { processed: snapshots.length, sent, skipped };
  }
}
