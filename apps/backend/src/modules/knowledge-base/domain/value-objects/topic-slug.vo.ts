import { InvalidTopicSlugError } from '../errors/domain.errors';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const MVP_TOPIC_SLUGS = [
  'fazer-pix',
  'codigo-govbr',
  'whatsapp-contato-localizacao',
  'wifi-qr-code',
  'segunda-via-boleto',
  'alerta-golpe',
] as const;

export type MvpTopicSlug = (typeof MVP_TOPIC_SLUGS)[number];

export class TopicSlug {
  private constructor(public readonly value: string) {}

  static create(raw: string): TopicSlug {
    const normalized = raw.trim().toLowerCase();
    if (normalized.length < 3 || normalized.length > 64 || !SLUG_PATTERN.test(normalized)) {
      throw new InvalidTopicSlugError(raw);
    }
    return new TopicSlug(normalized);
  }

  equals(other: TopicSlug): boolean {
    return this.value === other.value;
  }
}
