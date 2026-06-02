import { InvalidMessageContentError } from '../errors/domain.errors';

const MIN_LENGTH = 1;
const MAX_LENGTH = 4000;

export class MessageContent {
  private constructor(public readonly value: string) {}

  static create(raw: string): MessageContent {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
      throw new InvalidMessageContentError(
        `Conteúdo deve ter entre ${MIN_LENGTH} e ${MAX_LENGTH} caracteres.`,
      );
    }
    return new MessageContent(trimmed);
  }
}
