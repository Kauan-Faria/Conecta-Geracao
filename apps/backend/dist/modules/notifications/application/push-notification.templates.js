"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConversationReminder = buildConversationReminder;
exports.buildAiResponseReady = buildAiResponseReady;
exports.buildEducationalTip = buildEducationalTip;
exports.buildCampaignNotification = buildCampaignNotification;
const push_notification_vo_1 = require("../domain/value-objects/push-notification.vo");
const APP_TITLE = 'Conecta Geração';
function buildConversationReminder(conversationId) {
    return push_notification_vo_1.PushNotification.create({
        type: 'reminder',
        title: APP_TITLE,
        body: 'Você tem uma conversa aguardando. Toque para continuar.',
        deepLink: `/conversations/${conversationId}`,
        conversationId,
    });
}
function buildAiResponseReady(conversationId) {
    return push_notification_vo_1.PushNotification.create({
        type: 'ai_response',
        title: APP_TITLE,
        body: 'Sua orientação está pronta.',
        deepLink: `/conversations/${conversationId}`,
        conversationId,
    });
}
function buildEducationalTip(tip) {
    return push_notification_vo_1.PushNotification.create({
        type: 'tip',
        title: tip.title,
        body: tip.body,
        deepLink: tip.deepLink,
    });
}
function buildCampaignNotification(campaign) {
    return push_notification_vo_1.PushNotification.create({
        type: 'campaign',
        title: campaign.title,
        body: campaign.body,
        deepLink: campaign.deepLink,
    });
}
//# sourceMappingURL=push-notification.templates.js.map