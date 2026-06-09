import { POI_CATEGORIES } from '../../domain/value-objects/poi-category.vo';
export declare class GeoPointDto {
    lat: number;
    lon: number;
}
export declare class SearchPoisRequestDto {
    lat: number;
    lon: number;
    category: (typeof POI_CATEGORIES)[number];
    radiusKm?: number;
}
export declare class GeocodePlaceRequestDto {
    query: string;
}
export declare class GetRouteRequestDto {
    origin: GeoPointDto;
    destination: GeoPointDto;
}
