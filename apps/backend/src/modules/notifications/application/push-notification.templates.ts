import { PushNotification } from '../domain/value-objects/push-notification.vo';

const APP_TITLE = 'Conecta Geração';

export function buildConversationReminder(conversationId: string): PushNotification {
  return PushNotification.create({
    type: 'reminder',
    title: APP_TITLE,
    body: 'Você tem uma conversa aguardando. Toque para continuar.',
    deepLink: `/conversations/${conversationId}`,
    conversationId,
  });
}

export function buildAiResponseReady(conversationId: string): PushNotification {
  return PushNotification.create({
    type: 'ai_response',
    title: APP_TITLE,
    body: 'Sua orientação está pronta.',
    deepLink: `/conversations/${conversationId}`,
    conversationId,
  });
}

export function buildEducationalTip(tip: {
  title: string;
  body: string;
  deepLink: string;
}): PushNotification {
  return PushNotification.create({
    type: 'tip',
    title: tip.title,
    body: tip.body,
    deepLink: tip.deepLink,
  });
}

export function buildCampaignNotification(campaign: {
  title: string;
  body: string;
  deepLink: string;
}): PushNotification {
  return PushNotification.create({
    type: 'campaign',
    title: campaign.title,
    body: campaign.body,
    deepLink: campaign.deepLink,
  });
}
