import { GeoPoint } from '../../../maps/domain/value-objects/geo-point.vo';
import {
  PoiCategory,
  PoiCategoryValue,
} from '../../../maps/domain/value-objects/poi-category.vo';
import { SearchRadius } from '../../../maps/domain/value-objects/search-radius.vo';

export const MAP_SEARCH_TYPE = 'map_search' as const;

export interface MapActionJson {
  type: typeof MAP_SEARCH_TYPE;
  category: PoiCategoryValue;
  radiusKm: number;
  center?: { lat: number; lon: number } | null;
}

export class MapAction {
  readonly type = MAP_SEARCH_TYPE;
  readonly category: PoiCategory;
  readonly radius: SearchRadius;
  readonly center?: GeoPoint | null;

  private constructor(
    category: PoiCategory,
    radius: SearchRadius,
    center?: GeoPoint | null,
  ) {
    this.category = category;
    this.radius = radius;
    this.center = center ?? null;
  }

  static create(params: {
    category: PoiCategory;
    radius: SearchRadius;
    center?: GeoPoint | null;
  }): MapAction {
    return new MapAction(params.category, params.radius, params.center);
  }

  toJson(): MapActionJson {
    const json: MapActionJson = {
      type: this.type,
      category: this.category.value,
      radiusKm: this.radius.kilometers,
    };
    if (this.center) {
      json.center = { lat: this.center.lat, lon: this.center.lon };
    }
    return json;
  }
}
