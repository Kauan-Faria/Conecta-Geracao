import { GeocodeResult, RouteResult } from '../../domain/entities/maps.entities';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { PlaceQuery } from '../../domain/value-objects/place-query.vo';
import { OverpassElement } from '../../domain/services/osm-response-normalizer.service';
export declare const OVERPASS_GATEWAY: unique symbol;
export interface OverpassGateway {
    searchAround(center: GeoPoint, radiusMeters: number, tagFilters: Array<Record<string, string>>): Promise<OverpassElement[]>;
}
export declare const NOMINATIM_GATEWAY: unique symbol;
export interface NominatimGateway {
    geocode(query: PlaceQuery): Promise<GeocodeResult | null>;
    reverseGeocode(point: GeoPoint): Promise<GeocodeResult | null>;
}
export declare const OSRM_GATEWAY: unique symbol;
export interface OsrmGateway {
    getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult | null>;
}
