import { GeoPoint } from '../../../maps/domain/value-objects/geo-point.vo';
import { PoiCategory, PoiCategoryValue } from '../../../maps/domain/value-objects/poi-category.vo';
import { SearchRadius } from '../../../maps/domain/value-objects/search-radius.vo';
export declare const MAP_SEARCH_TYPE: "map_search";
export interface MapActionJson {
    type: typeof MAP_SEARCH_TYPE;
    category: PoiCategoryValue;
    radiusKm: number;
    center?: {
        lat: number;
        lon: number;
    } | null;
}
export declare class MapAction {
    readonly type: "map_search";
    readonly category: PoiCategory;
    readonly radius: SearchRadius;
    readonly center?: GeoPoint | null;
    private constructor();
    static create(params: {
        category: PoiCategory;
        radius: SearchRadius;
        center?: GeoPoint | null;
    }): MapAction;
    toJson(): MapActionJson;
}
