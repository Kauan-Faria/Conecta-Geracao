export declare class GeoPoint {
    readonly lat: number;
    readonly lon: number;
    private constructor();
    static create(lat: number, lon: number): GeoPoint;
    equals(other: GeoPoint): boolean;
}
