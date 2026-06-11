import { Module } from '@nestjs/common';

import { ABANDONED_CONVERSATION_QUERY } from './application/ports/abandoned-conversation.query';
import { ACTIVE_USER_QUERY } from './application/ports/active-user.query';
import { ASSISTANT_REPLY_NOTIFICATION_TRIGGER } from './application/ports/assistant-reply-notification.trigger';
import { CAMPAIGN_REPOSITORY } from './application/ports/campaign.repository';
import { DEVICE_TOKEN_REPOSITORY } from './application/ports/device-token.repository';
import { EDUCATIONAL_TIP_CATALOG_REPOSITORY } from './application/ports/educational-tip-catalog.repository';
import { NOTIFICATION_ANALYTICS_PORT } from './application/ports/notification-analytics.port';
import { NOTIFICATION_DELIVERY_LOG_REPOSITORY } from './application/ports/notification-delivery-log.repository';
import { NOTIFICATION_PREFERENCE_REPOSITORY } from './application/ports/notification-preference.repository';
import { PUSH_NOTIFICATION_PROVIDER } from './application/ports/push-notification.provider';
import { DeactivateDeviceTokenUseCase } from './application/use-cases/deactivate-device-token.use-case';
import { GetNotificationPreferenceUseCase } from './application/use-cases/get-notification-preference.use-case';
import { NotifyAiResponseReadyUseCase } from './application/use-cases/notify-ai-response-ready.use-case';
import { ProcessAbandonedConversationsUseCase } from './application/use-cases/process-abandoned-conversations.use-case';
import { ProcessWeeklyEducationalTipsUseCase } from './application/use-cases/process-weekly-educational-tips.use-case';
import { RegisterDeviceTokenUseCase } from './application/use-cases/register-device-token.use-case';
import { SendInternalCampaignUseCase } from './application/use-cases/send-internal-campaign.use-case';
import { SendPushNotificationUseCase } from './application/use-cases/send-push-notification.use-case';
import { UpdateNotificationPreferenceUseCase } from './application/use-cases/update-notification-preference.use-case';
import { isFcmEnabled } from './domain/config/notification.config';
import { AbandonedConversationPolicy } from './domain/services/abandoned-conversation.policy';
import { AiResponseNotificationPolicy } from './domain/services/ai-response-notification.policy';
import { CampaignEligibilityPolicy } from './domain/services/campaign-eligibility.policy';
import { CampaignIdempotencyPolicy } from './domain/services/campaign-idempotency.policy';
import { CuratedContentPolicy } from './domain/services/curated-content.policy';
import { InternalCampaignAuthPolicy } from './domain/services/internal-campaign-auth.policy';
import { NotificationEligibilityPolicy } from './domain/services/notification-eligibility.policy';
import { PushNotificationPayloadPolicy } from './domain/services/push-notification-payload.policy';
import { ReminderCooldownPolicy } from './domain/services/reminder-cooldown.policy';
import { TipSelectionPolicy } from './domain/services/tip-selection.policy';
import { TipWeeklyRateLimitPolicy } from './domain/services/tip-weekly-rate-limit.policy';
import { PinoNotificationAnalyticsAdapter } from './infrastructure/analytics/pino-notification-analytics.adapter';
import { InternalServiceKeyGuard } from './infrastructure/auth/internal-service-key.guard';
import { PrismaAbandonedConversationQuery } from './infrastructure/conversations/prisma-abandoned-conversation.query';
import { FcmPushNotificationProvider } from './infrastructure/fcm/fcm-push-notification.provider';
import { NoOpPushNotificationProvider } from './infrastructure/fcm/no-op-push-notification.provider';
import { AbandonedConversationsJob } from './infrastructure/jobs/abandoned-conversations.job';
import { WeeklyEducationalTipsJob } from './infrastructure/jobs/weekly-educational-tips.job';
import { PrismaCampaignRepository } from './infrastructure/persistence/prisma-campaign.repository';
import { PrismaDeviceTokenRepository } from './infrastructure/persistence/prisma-device-token.repository';
import { PrismaEducationalTipCatalogRepository } from './infrastructure/persistence/prisma-educational-tip-catalog.repository';
import { PrismaNotificationDeliveryLogRepository } from './infrastructure/persistence/prisma-notification-delivery-log.repository';
import { PrismaNotificationPreferenceRepository } from './infrastructure/persistence/prisma-notification-preference.repository';
import { AssistantReplyNotificationTriggerImpl } from './infrastructure/triggers/assistant-reply-notification.trigger.impl';
import { PrismaActiveUserQuery } from './infrastructure/users/prisma-active-user.query';
import { InternalCampaignsController } from './presentation/internal-campaigns.controller';
import { NotificationsController } from './presentation/notifications.controller';

@Module({
  controllers: [NotificationsController, InternalCampaignsController],
  providers: [
    PushNotificationPayloadPolicy,
    NotificationEligibilityPolicy,
    ReminderCooldownPolicy,
    AbandonedConversationPolicy,
    AiResponseNotificationPolicy,
    CuratedContentPolicy,
    TipWeeklyRateLimitPolicy,
    TipSelectionPolicy,
    CampaignEligibilityPolicy,
    CampaignIdempotencyPolicy,
    InternalCampaignAuthPolicy,
    InternalServiceKeyGuard,
    { provide: DEVICE_TOKEN_REPOSITORY, useClass: PrismaDeviceTokenRepository },
    { provide: NOTIFICATION_PREFERENCE_REPOSITORY, useClass: PrismaNotificationPreferenceRepository },
    { provide: NOTIFICATION_DELIVERY_LOG_REPOSITORY, useClass: PrismaNotificationDeliveryLogRepository },
    { provide: EDUCATIONAL_TIP_CATALOG_REPOSITORY, useClass: PrismaEducationalTipCatalogRepository },
    { provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
    { provide: NOTIFICATION_ANALYTICS_PORT, useClass: PinoNotificationAnalyticsAdapter },
    { provide: ACTIVE_USER_QUERY, useClass: PrismaActiveUserQuery },
    { provide: ABANDONED_CONVERSATION_QUERY, useClass: PrismaAbandonedConversationQuery },
    {
      provide: PUSH_NOTIFICATION_PROVIDER,
      useClass: isFcmEnabled() ? FcmPushNotificationProvider : NoOpPushNotificationProvider,
    },
    { provide: ASSISTANT_REPLY_NOTIFICATION_TRIGGER, useClass: AssistantReplyNotificationTriggerImpl },
    RegisterDeviceTokenUseCase,
    UpdateNotificationPreferenceUseCase,
    DeactivateDeviceTokenUseCase,
    GetNotificationPreferenceUseCase,
    SendPushNotificationUseCase,
    ProcessAbandonedConversationsUseCase,
    NotifyAiResponseReadyUseCase,
    ProcessWeeklyEducationalTipsUseCase,
    SendInternalCampaignUseCase,
    AbandonedConversationsJob,
    WeeklyEducationalTipsJob,
  ],
  exports: [
    DEVICE_TOKEN_REPOSITORY,
    NOTIFICATION_PREFERENCE_REPOSITORY,
    ASSISTANT_REPLY_NOTIFICATION_TRIGGER,
    SendPushNotificationUseCase,
  ],
})
export class NotificationsModule {}
