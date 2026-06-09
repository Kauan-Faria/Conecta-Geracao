import { PoiResult } from '../entities/maps.entities';
import { GeoPoint } from '../value-objects/geo-point.vo';
import { GeoDistanceCalculator } from './geo-distance-calculator.service';
export interface OverpassElement {
    type: 'node' | 'way' | 'relation';
    id: number;
    lat?: number;
    lon?: number;
    center?: {
        lat: number;
        lon: number;
    };
    tags?: Record<string, string>;
}
export declare class OsmResponseNormalizer {
    private readonly distanceCalculator;
    constructor(distanceCalculator: GeoDistanceCalculator);
    normalizePois(raw: OverpassElement[], center: GeoPoint): PoiResult[];
    private extractCoordinates;
    private buildAddress;
}
