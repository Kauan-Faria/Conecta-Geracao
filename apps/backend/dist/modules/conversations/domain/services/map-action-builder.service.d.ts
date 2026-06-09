import { MapAction } from '../value-objects/map-action.vo';
import { GeoPoint } from '../../../maps/domain/value-objects/geo-point.vo';
import { PoiCategory } from '../../../maps/domain/value-objects/poi-category.vo';
import { SearchRadius } from '../../../maps/domain/value-objects/search-radius.vo';
export declare class MapActionBuilder {
    build(params: {
        category: PoiCategory;
        radius: SearchRadius;
        center?: GeoPoint | null;
    }): MapAction;
}
