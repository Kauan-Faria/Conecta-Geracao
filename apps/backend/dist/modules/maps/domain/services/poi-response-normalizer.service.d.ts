import { PoiResult } from '../entities/maps.entities';
import { GeoPoint } from '../value-objects/geo-point.vo';
import { GeoDistanceCalculator } from './geo-distance-calculator.service';
export interface ExternalPoiEntry {
    externalId: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
}
export declare class PoiResponseNormalizer {
    private readonly distanceCalculator;
    constructor(distanceCalculator: GeoDistanceCalculator);
    normalizePois(raw: ExternalPoiEntry[], center: GeoPoint): PoiResult[];
}
