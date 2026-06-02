export type DomainErrorCode =
  | 'INVALID_SLUG'
  | 'CONTENT_POLICY'
  | 'DUPLICATE_SLUG'
  | 'TOPIC_NOT_FOUND';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidTopicSlugError extends DomainError {
  constructor(slug: string) {
    super('INVALID_SLUG', `Slug inválido: ${slug}`);
  }
}

export class ContentPolicyViolationError extends DomainError {
  constructor(message: string) {
    super('CONTENT_POLICY', message);
  }
}

export class TopicNotFoundError extends DomainError {
  constructor(slug: string) {
    super('TOPIC_NOT_FOUND', `Tópico não encontrado: ${slug}`);
  }
}
