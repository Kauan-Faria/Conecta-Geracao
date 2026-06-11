import { PushNotification } from '../domain/value-objects/push-notification.vo';
export declare function buildConversationReminder(conversationId: string): PushNotification;
export declare function buildAiResponseReady(conversationId: string): PushNotification;
export declare function buildEducationalTip(tip: {
    title: string;
    body: string;
    deepLink: string;
}): PushNotification;
export declare function buildCampaignNotification(campaign: {
    title: string;
    body: string;
    deepLink: string;
}): PushNotification;
