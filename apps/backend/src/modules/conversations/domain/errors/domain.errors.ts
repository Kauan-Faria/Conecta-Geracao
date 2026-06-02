export type DomainErrorCode =
  | 'CONVERSATION_NOT_FOUND'
  | 'CONVERSATION_CLOSED'
  | 'INVALID_MESSAGE_CONTENT'
  | 'INVALID_TOPIC_SLUG';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ConversationNotFoundError extends DomainError {
  constructor() {
    super('CONVERSATION_NOT_FOUND', 'Conversa não encontrada.');
  }
}

export class ConversationClosedError extends DomainError {
  constructor() {
    super('CONVERSATION_CLOSED', 'Esta conversa já foi encerrada.');
  }
}

export class InvalidMessageContentError extends DomainError {
  constructor(message = 'Conteúdo da mensagem inválido.') {
    super('INVALID_MESSAGE_CONTENT', message);
  }
}

export class InvalidTopicSlugRefError extends DomainError {
  constructor(slug: string) {
    super('INVALID_TOPIC_SLUG', `Slug de tópico inválido: ${slug}`);
  }
}
