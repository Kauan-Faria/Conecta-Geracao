import { PoiCategory, PoiCategoryValue } from '../value-objects/poi-category.vo';

export class PoiCategoryMapper {
  toGooglePlaceType(category: PoiCategory): string {
    return GOOGLE_PLACE_TYPES[category.value];
  }
}

const GOOGLE_PLACE_TYPES: Record<PoiCategoryValue, string> = {
  pharmacy: 'pharmacy',
  health_post: 'doctor',
  hospital: 'hospital',
  bank: 'bank',
  post_office: 'post_office',
  supermarket: 'supermarket',
};
