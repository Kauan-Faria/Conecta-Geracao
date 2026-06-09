import { PoiCategory, PoiCategoryValue } from '../value-objects/poi-category.vo';

export type OverpassTagFilter = Record<string, string>;

export class PoiCategoryMapper {
  toOverpassFilters(category: PoiCategory): OverpassTagFilter[] {
    return CATEGORY_FILTERS[category.value];
  }
}

const CATEGORY_FILTERS: Record<PoiCategoryValue, OverpassTagFilter[]> = {
  pharmacy: [{ amenity: 'pharmacy' }],
  health_post: [
    { amenity: 'clinic' },
    { healthcare: 'centre' },
    { amenity: 'health_post' },
  ],
  hospital: [{ amenity: 'hospital' }, { emergency: 'emergency_ward_entrance' }],
  bank: [{ amenity: 'bank' }, { amenity: 'bureau_de_change' }, { shop: 'lottery' }],
  post_office: [{ amenity: 'post_office' }],
  supermarket: [{ shop: 'supermarket' }],
};
