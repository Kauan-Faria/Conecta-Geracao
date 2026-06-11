import { InvalidFcmTokenError } from '../errors/domain.errors';

const MIN_LENGTH = 10;

export class FcmToken {
  private constructor(public readonly value: string) {}

  static create(raw: string): FcmToken {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      throw new InvalidFcmTokenError(
        `Token FCM deve ter pelo menos ${MIN_LENGTH} caracteres.`,
      );
    }
    return new FcmToken(trimmed);
  }
}
