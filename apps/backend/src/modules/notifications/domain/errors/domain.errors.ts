export type DomainErrorCode =
  | 'INVALID_FCM_TOKEN'
  | 'INVALID_DEVICE_PLATFORM'
  | 'INVALID_FIREBASE_UID'
  | 'INVALID_PUSH_NOTIFICATION'
  | 'INVALID_CAMPAIGN_SEGMENT'
  | 'DYNAMIC_CONTENT_NOT_ALLOWED'
  | 'CAMPAIGN_BATCH_LIMIT_EXCEEDED';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidFcmTokenError extends DomainError {
  constructor(message = 'Token FCM inválido.') {
    super('INVALID_FCM_TOKEN', message);
  }
}

export class InvalidDevicePlatformError extends DomainError {
  constructor(platform: string) {
    super('INVALID_DEVICE_PLATFORM', `Plataforma inválida: ${platform}`);
  }
}

export class InvalidFirebaseUidError extends DomainError {
  constructor(message = 'Identificador de usuário inválido.') {
    super('INVALID_FIREBASE_UID', message);
  }
}

export class InvalidPushNotificationError extends DomainError {
  constructor(message: string) {
    super('INVALID_PUSH_NOTIFICATION', message);
  }
}

export class InvalidCampaignSegmentError extends DomainError {
  constructor(message: string) {
    super('INVALID_CAMPAIGN_SEGMENT', message);
  }
}

export class DynamicContentNotAllowedError extends DomainError {
  constructor(message = 'Conteúdo dinâmico não permitido para dicas educativas.') {
    super('DYNAMIC_CONTENT_NOT_ALLOWED', message);
  }
}

export class CampaignBatchLimitExceededError extends DomainError {
  constructor(limit: number) {
    super(
      'CAMPAIGN_BATCH_LIMIT_EXCEEDED',
      `Segmento excede o limite de ${limit} destinatários no MVP.`,
    );
  }
}
