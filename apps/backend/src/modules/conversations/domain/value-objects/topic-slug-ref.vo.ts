import { InvalidTopicSlugRefError } from '../errors/domain.errors';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class TopicSlugRef {
  private constructor(public readonly value: string) {}

  static createOptional(raw?: string | null): TopicSlugRef | null {
    if (raw === undefined || raw === null || raw.trim() === '') {
      return null;
    }
    const normalized = raw.trim().toLowerCase();
    if (normalized.length < 3 || normalized.length > 64 || !SLUG_PATTERN.test(normalized)) {
      throw new InvalidTopicSlugRefError(raw);
    }
    return new TopicSlugRef(normalized);
  }
}
