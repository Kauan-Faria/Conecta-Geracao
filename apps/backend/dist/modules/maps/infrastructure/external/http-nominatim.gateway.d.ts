import { NominatimGateway } from '../../application/ports/maps.gateways';
import { GeocodeResult } from '../../domain/entities/maps.entities';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { PlaceQuery } from '../../domain/value-objects/place-query.vo';
import { InMemoryGeocodeCache } from '../cache/in-memory-geocode.cache';
import { MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';
export declare class HttpNominatimGateway implements NominatimGateway {
    private readonly http;
    private readonly cache;
    private readonly config;
    private lastRequestAt;
    constructor(http: MapsHttpClient, cache: InMemoryGeocodeCache, config: MapsConfig);
    geocode(query: PlaceQuery): Promise<GeocodeResult | null>;
    reverseGeocode(point: GeoPoint): Promise<GeocodeResult | null>;
    private fetchGeocode;
    private waitForThrottle;
}
