import { GeocodeResult, RouteResult } from '../../domain/entities/maps.entities';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { PlaceQuery } from '../../domain/value-objects/place-query.vo';
import { OverpassElement } from '../../domain/services/osm-response-normalizer.service';

export const OVERPASS_GATEWAY = Symbol('OVERPASS_GATEWAY');

export interface OverpassGateway {
  searchAround(
    center: GeoPoint,
    radiusMeters: number,
    tagFilters: Array<Record<string, string>>,
  ): Promise<OverpassElement[]>;
}

export const NOMINATIM_GATEWAY = Symbol('NOMINATIM_GATEWAY');

export interface NominatimGateway {
  geocode(query: PlaceQuery): Promise<GeocodeResult | null>;
  reverseGeocode(point: GeoPoint): Promise<GeocodeResult | null>;
}

export const OSRM_GATEWAY = Symbol('OSRM_GATEWAY');

export interface OsrmGateway {
  getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult | null>;
}
