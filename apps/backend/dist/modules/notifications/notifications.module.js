"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const abandoned_conversation_query_1 = require("./application/ports/abandoned-conversation.query");
const active_user_query_1 = require("./application/ports/active-user.query");
const assistant_reply_notification_trigger_1 = require("./application/ports/assistant-reply-notification.trigger");
const campaign_repository_1 = require("./application/ports/campaign.repository");
const device_token_repository_1 = require("./application/ports/device-token.repository");
const educational_tip_catalog_repository_1 = require("./application/ports/educational-tip-catalog.repository");
const notification_analytics_port_1 = require("./application/ports/notification-analytics.port");
const notification_delivery_log_repository_1 = require("./application/ports/notification-delivery-log.repository");
const notification_preference_repository_1 = require("./application/ports/notification-preference.repository");
const push_notification_provider_1 = require("./application/ports/push-notification.provider");
const deactivate_device_token_use_case_1 = require("./application/use-cases/deactivate-device-token.use-case");
const get_notification_preference_use_case_1 = require("./application/use-cases/get-notification-preference.use-case");
const notify_ai_response_ready_use_case_1 = require("./application/use-cases/notify-ai-response-ready.use-case");
const process_abandoned_conversations_use_case_1 = require("./application/use-cases/process-abandoned-conversations.use-case");
const process_weekly_educational_tips_use_case_1 = require("./application/use-cases/process-weekly-educational-tips.use-case");
const register_device_token_use_case_1 = require("./application/use-cases/register-device-token.use-case");
const send_internal_campaign_use_case_1 = require("./application/use-cases/send-internal-campaign.use-case");
const send_push_notification_use_case_1 = require("./application/use-cases/send-push-notification.use-case");
const update_notification_preference_use_case_1 = require("./application/use-cases/update-notification-preference.use-case");
const notification_config_1 = require("./domain/config/notification.config");
const abandoned_conversation_policy_1 = require("./domain/services/abandoned-conversation.policy");
const ai_response_notification_policy_1 = require("./domain/services/ai-response-notification.policy");
const campaign_eligibility_policy_1 = require("./domain/services/campaign-eligibility.policy");
const campaign_idempotency_policy_1 = require("./domain/services/campaign-idempotency.policy");
const curated_content_policy_1 = require("./domain/services/curated-content.policy");
const internal_campaign_auth_policy_1 = require("./domain/services/internal-campaign-auth.policy");
const notification_eligibility_policy_1 = require("./domain/services/notification-eligibility.policy");
const push_notification_payload_policy_1 = require("./domain/services/push-notification-payload.policy");
const reminder_cooldown_policy_1 = require("./domain/services/reminder-cooldown.policy");
const tip_selection_policy_1 = require("./domain/services/tip-selection.policy");
const tip_weekly_rate_limit_policy_1 = require("./domain/services/tip-weekly-rate-limit.policy");
const pino_notification_analytics_adapter_1 = require("./infrastructure/analytics/pino-notification-analytics.adapter");
const internal_service_key_guard_1 = require("./infrastructure/auth/internal-service-key.guard");
const prisma_abandoned_conversation_query_1 = require("./infrastructure/conversations/prisma-abandoned-conversation.query");
const fcm_push_notification_provider_1 = require("./infrastructure/fcm/fcm-push-notification.provider");
const no_op_push_notification_provider_1 = require("./infrastructure/fcm/no-op-push-notification.provider");
const abandoned_conversations_job_1 = require("./infrastructure/jobs/abandoned-conversations.job");
const weekly_educational_tips_job_1 = require("./infrastructure/jobs/weekly-educational-tips.job");
const prisma_campaign_repository_1 = require("./infrastructure/persistence/prisma-campaign.repository");
const prisma_device_token_repository_1 = require("./infrastructure/persistence/prisma-device-token.repository");
const prisma_educational_tip_catalog_repository_1 = require("./infrastructure/persistence/prisma-educational-tip-catalog.repository");
const prisma_notification_delivery_log_repository_1 = require("./infrastructure/persistence/prisma-notification-delivery-log.repository");
const prisma_notification_preference_repository_1 = require("./infrastructure/persistence/prisma-notification-preference.repository");
const assistant_reply_notification_trigger_impl_1 = require("./infrastructure/triggers/assistant-reply-notification.trigger.impl");
const prisma_active_user_query_1 = require("./infrastructure/users/prisma-active-user.query");
const internal_campaigns_controller_1 = require("./presentation/internal-campaigns.controller");
const notifications_controller_1 = require("./presentation/notifications.controller");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        controllers: [notifications_controller_1.NotificationsController, internal_campaigns_controller_1.InternalCampaignsController],
        providers: [
            push_notification_payload_policy_1.PushNotificationPayloadPolicy,
            notification_eligibility_policy_1.NotificationEligibilityPolicy,
            reminder_cooldown_policy_1.ReminderCooldownPolicy,
            abandoned_conversation_policy_1.AbandonedConversationPolicy,
            ai_response_notification_policy_1.AiResponseNotificationPolicy,
            curated_content_policy_1.CuratedContentPolicy,
            tip_weekly_rate_limit_policy_1.TipWeeklyRateLimitPolicy,
            tip_selection_policy_1.TipSelectionPolicy,
            campaign_eligibility_policy_1.CampaignEligibilityPolicy,
            campaign_idempotency_policy_1.CampaignIdempotencyPolicy,
            internal_campaign_auth_policy_1.InternalCampaignAuthPolicy,
            internal_service_key_guard_1.InternalServiceKeyGuard,
            { provide: device_token_repository_1.DEVICE_TOKEN_REPOSITORY, useClass: prisma_device_token_repository_1.PrismaDeviceTokenRepository },
            { provide: notification_preference_repository_1.NOTIFICATION_PREFERENCE_REPOSITORY, useClass: prisma_notification_preference_repository_1.PrismaNotificationPreferenceRepository },
            { provide: notification_delivery_log_repository_1.NOTIFICATION_DELIVERY_LOG_REPOSITORY, useClass: prisma_notification_delivery_log_repository_1.PrismaNotificationDeliveryLogRepository },
            { provide: educational_tip_catalog_repository_1.EDUCATIONAL_TIP_CATALOG_REPOSITORY, useClass: prisma_educational_tip_catalog_repository_1.PrismaEducationalTipCatalogRepository },
            { provide: campaign_repository_1.CAMPAIGN_REPOSITORY, useClass: prisma_campaign_repository_1.PrismaCampaignRepository },
            { provide: notification_analytics_port_1.NOTIFICATION_ANALYTICS_PORT, useClass: pino_notification_analytics_adapter_1.PinoNotificationAnalyticsAdapter },
            { provide: active_user_query_1.ACTIVE_USER_QUERY, useClass: prisma_active_user_query_1.PrismaActiveUserQuery },
            { provide: abandoned_conversation_query_1.ABANDONED_CONVERSATION_QUERY, useClass: prisma_abandoned_conversation_query_1.PrismaAbandonedConversationQuery },
            {
                provide: push_notification_provider_1.PUSH_NOTIFICATION_PROVIDER,
                useClass: (0, notification_config_1.isFcmEnabled)() ? fcm_push_notification_provider_1.FcmPushNotificationProvider : no_op_push_notification_provider_1.NoOpPushNotificationProvider,
            },
            { provide: assistant_reply_notification_trigger_1.ASSISTANT_REPLY_NOTIFICATION_TRIGGER, useClass: assistant_reply_notification_trigger_impl_1.AssistantReplyNotificationTriggerImpl },
            register_device_token_use_case_1.RegisterDeviceTokenUseCase,
            update_notification_preference_use_case_1.UpdateNotificationPreferenceUseCase,
            deactivate_device_token_use_case_1.DeactivateDeviceTokenUseCase,
            get_notification_preference_use_case_1.GetNotificationPreferenceUseCase,
            send_push_notification_use_case_1.SendPushNotificationUseCase,
            process_abandoned_conversations_use_case_1.ProcessAbandonedConversationsUseCase,
            notify_ai_response_ready_use_case_1.NotifyAiResponseReadyUseCase,
            process_weekly_educational_tips_use_case_1.ProcessWeeklyEducationalTipsUseCase,
            send_internal_campaign_use_case_1.SendInternalCampaignUseCase,
            abandoned_conversations_job_1.AbandonedConversationsJob,
            weekly_educational_tips_job_1.WeeklyEducationalTipsJob,
        ],
        exports: [
            device_token_repository_1.DEVICE_TOKEN_REPOSITORY,
            notification_preference_repository_1.NOTIFICATION_PREFERENCE_REPOSITORY,
            assistant_reply_notification_trigger_1.ASSISTANT_REPLY_NOTIFICATION_TRIGGER,
            send_push_notification_use_case_1.SendPushNotificationUseCase,
        ],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map