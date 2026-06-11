import { RouteGateway } from '../../application/ports/maps.gateways';
import { RouteResult } from '../../domain/entities/maps.entities';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';
export declare class HttpGoogleDirectionsGateway implements RouteGateway {
    private readonly http;
    private readonly config;
    constructor(http: MapsHttpClient, config: MapsConfig);
    getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult | null>;
    private parseDurationSeconds;
}
