export type NotificationTypeValue = 'reminder' | 'ai_response' | 'tip' | 'campaign';

export class NotificationType {
  private constructor(public readonly value: NotificationTypeValue) {}

  static reminder(): NotificationType {
    return new NotificationType('reminder');
  }

  static aiResponse(): NotificationType {
    return new NotificationType('ai_response');
  }

  static tip(): NotificationType {
    return new NotificationType('tip');
  }

  static campaign(): NotificationType {
    return new NotificationType('campaign');
  }

  static create(raw: string): NotificationType {
    switch (raw) {
      case 'reminder':
        return NotificationType.reminder();
      case 'ai_response':
        return NotificationType.aiResponse();
      case 'tip':
        return NotificationType.tip();
      case 'campaign':
        return NotificationType.campaign();
      default:
        throw new Error(`Tipo de notificação inválido: ${raw}`);
    }
  }
}
