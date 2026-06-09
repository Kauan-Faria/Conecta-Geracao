import { GeoPoint } from '../value-objects/geo-point.vo';
export declare class GeoDistanceCalculator {
    haversineMeters(from: GeoPoint, to: GeoPoint): number;
    private toRadians;
}
