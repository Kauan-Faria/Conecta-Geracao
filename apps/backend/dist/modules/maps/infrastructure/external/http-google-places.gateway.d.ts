import { PoiSearchGateway } from '../../application/ports/maps.gateways';
import { ExternalPoiEntry } from '../../domain/services/poi-response-normalizer.service';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';
export declare class HttpGooglePlacesGateway implements PoiSearchGateway {
    private readonly http;
    private readonly config;
    constructor(http: MapsHttpClient, config: MapsConfig);
    searchAround(center: GeoPoint, radiusMeters: number, placeType: string): Promise<ExternalPoiEntry[]>;
    private toExternalPoiEntry;
}
