import { GeocodeResult, PoiResult, PoiSearchResult, StaticRoute } from '../../domain/entities/maps.entities';
export interface PoiResultDto {
    osmId: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
    distanceMeters: number;
}
export interface PoiSearchResponseDto {
    center: {
        lat: number;
        lon: number;
    };
    radiusKm: number;
    category: string;
    results: PoiResultDto[];
}
export interface GeocodeResponseDto {
    lat: number;
    lon: number;
    displayName: string;
}
export interface RouteResponseDto {
    polyline: string;
    distanceMeters: number;
    durationSeconds: number;
}
export declare function toPoiResultDto(result: PoiResult): PoiResultDto;
export declare function toPoiSearchResponse(result: PoiSearchResult): PoiSearchResponseDto;
export declare function toGeocodeResponse(result: GeocodeResult): GeocodeResponseDto;
export declare function toRouteResponse(route: StaticRoute): RouteResponseDto;
