import { GeocodeResult, RouteResult } from '../../domain/entities/maps.entities';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { PlaceQuery } from '../../domain/value-objects/place-query.vo';
import { ExternalPoiEntry } from '../../domain/services/poi-response-normalizer.service';

export const POI_SEARCH_GATEWAY = Symbol('POI_SEARCH_GATEWAY');

export interface PoiSearchGateway {
  searchAround(
    center: GeoPoint,
    radiusMeters: number,
    placeType: string,
  ): Promise<ExternalPoiEntry[]>;
}

export const GEOCODING_GATEWAY = Symbol('GEOCODING_GATEWAY');

export interface GeocodingGateway {
  geocode(query: PlaceQuery): Promise<GeocodeResult | null>;
  reverseGeocode(point: GeoPoint): Promise<GeocodeResult | null>;
}

export const ROUTE_GATEWAY = Symbol('ROUTE_GATEWAY');

export interface RouteGateway {
  getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult | null>;
}

/** @deprecated Use POI_SEARCH_GATEWAY */
export const OVERPASS_GATEWAY = POI_SEARCH_GATEWAY;
/** @deprecated Use GEOCODING_GATEWAY */
export const NOMINATIM_GATEWAY = GEOCODING_GATEWAY;
/** @deprecated Use ROUTE_GATEWAY */
export const OSRM_GATEWAY = ROUTE_GATEWAY;

/** @deprecated Use PoiSearchGateway */
export type OverpassGateway = PoiSearchGateway;
/** @deprecated Use GeocodingGateway */
export type NominatimGateway = GeocodingGateway;
/** @deprecated Use RouteGateway */
export type OsrmGateway = RouteGateway;
