import { OverpassGateway } from '../../application/ports/maps.gateways';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { OverpassElement } from '../../domain/services/osm-response-normalizer.service';
import { MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';
export declare class HttpOverpassGateway implements OverpassGateway {
    private readonly http;
    private readonly config;
    constructor(http: MapsHttpClient, config: MapsConfig);
    searchAround(center: GeoPoint, radiusMeters: number, tagFilters: Array<Record<string, string>>): Promise<OverpassElement[]>;
}
