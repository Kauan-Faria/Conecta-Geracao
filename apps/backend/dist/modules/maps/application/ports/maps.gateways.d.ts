import { GeocodeResult, RouteResult } from '../../domain/entities/maps.entities';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { PlaceQuery } from '../../domain/value-objects/place-query.vo';
import { ExternalPoiEntry } from '../../domain/services/poi-response-normalizer.service';
export declare const POI_SEARCH_GATEWAY: unique symbol;
export interface PoiSearchGateway {
    searchAround(center: GeoPoint, radiusMeters: number, placeType: string): Promise<ExternalPoiEntry[]>;
}
export declare const GEOCODING_GATEWAY: unique symbol;
export interface GeocodingGateway {
    geocode(query: PlaceQuery): Promise<GeocodeResult | null>;
    reverseGeocode(point: GeoPoint): Promise<GeocodeResult | null>;
}
export declare const ROUTE_GATEWAY: unique symbol;
export interface RouteGateway {
    getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult | null>;
}
export declare const OVERPASS_GATEWAY: symbol;
export declare const NOMINATIM_GATEWAY: symbol;
export declare const OSRM_GATEWAY: symbol;
export type OverpassGateway = PoiSearchGateway;
export type NominatimGateway = GeocodingGateway;
export type OsrmGateway = RouteGateway;
