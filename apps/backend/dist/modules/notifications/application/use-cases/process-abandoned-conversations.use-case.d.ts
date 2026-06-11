import { AbandonedConversationPolicy } from '../../domain/services/abandoned-conversation.policy';
import { NotificationEligibilityPolicy } from '../../domain/services/notification-eligibility.policy';
import { ReminderCooldownPolicy } from '../../domain/services/reminder-cooldown.policy';
import { AbandonedConversationQuery } from '../ports/abandoned-conversation.query';
import { SendPushNotificationUseCase } from './send-push-notification.use-case';
export interface ProcessAbandonedConversationsResult {
    processed: number;
    sent: number;
    skipped: number;
}
export declare class ProcessAbandonedConversationsUseCase {
    private readonly abandonedQuery;
    private readonly abandonedPolicy;
    private readonly eligibilityPolicy;
    private readonly cooldownPolicy;
    private readonly sendPush;
    private readonly logger;
    constructor(abandonedQuery: AbandonedConversationQuery, abandonedPolicy: AbandonedConversationPolicy, eligibilityPolicy: NotificationEligibilityPolicy, cooldownPolicy: ReminderCooldownPolicy, sendPush: SendPushNotificationUseCase);
    execute(): Promise<ProcessAbandonedConversationsResult>;
}
