import { InvalidFirebaseUidError } from '../errors/domain.errors';

export class FirebaseUid {
  private constructor(public readonly value: string) {}

  static create(raw: string): FirebaseUid {
    const trimmed = raw.trim();
    if (!trimmed) {
      throw new InvalidFirebaseUidError();
    }
    return new FirebaseUid(trimmed);
  }
}
