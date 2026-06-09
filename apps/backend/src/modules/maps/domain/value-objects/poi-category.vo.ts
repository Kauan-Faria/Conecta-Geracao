import { InvalidPoiCategoryError } from '../errors/domain.errors';

export const POI_CATEGORIES = [
  'pharmacy',
  'health_post',
  'hospital',
  'bank',
  'post_office',
  'supermarket',
] as const;

export type PoiCategoryValue = (typeof POI_CATEGORIES)[number];

export class PoiCategory {
  readonly value: PoiCategoryValue;

  private constructor(value: PoiCategoryValue) {
    this.value = value;
  }

  static create(raw: string): PoiCategory {
    const normalized = raw.trim() as PoiCategoryValue;
    if (!POI_CATEGORIES.includes(normalized)) {
      throw new InvalidPoiCategoryError(raw);
    }
    return new PoiCategory(normalized);
  }
}
