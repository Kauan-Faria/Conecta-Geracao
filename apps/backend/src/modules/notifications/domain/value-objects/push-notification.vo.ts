import { InvalidPushNotificationError } from '../errors/domain.errors';
import { NotificationType, NotificationTypeValue } from './notification-type.vo';

export interface PushNotificationProps {
  type: NotificationTypeValue;
  title: string;
  body: string;
  deepLink: string;
  conversationId?: string;
}

const SENSITIVE_PATTERNS = [
  /\bpassword\b/i,
  /\botp\b/i,
  /\bcpf\b/i,
  /\bsenha\b/i,
];

export class PushNotification {
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly deepLink: string;
  readonly conversationId: string | null;

  private constructor(props: {
    type: NotificationType;
    title: string;
    body: string;
    deepLink: string;
    conversationId: string | null;
  }) {
    this.type = props.type;
    this.title = props.title;
    this.body = props.body;
    this.deepLink = props.deepLink;
    this.conversationId = props.conversationId;
  }

  static create(props: PushNotificationProps): PushNotification {
    const title = props.title.trim();
    const body = props.body.trim();
    const deepLink = props.deepLink.trim();

    if (!title || !body || !deepLink) {
      throw new InvalidPushNotificationError(
        'Título, corpo e deep link são obrigatórios.',
      );
    }

    const combined = `${title} ${body} ${deepLink}`;
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(combined)) {
        throw new InvalidPushNotificationError(
          'Payload de notificação contém conteúdo sensível.',
        );
      }
    }

    return new PushNotification({
      type: NotificationType.create(props.type),
      title,
      body,
      deepLink,
      conversationId: props.conversationId?.trim() ?? null,
    });
  }
}
