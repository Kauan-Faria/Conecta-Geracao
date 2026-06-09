export declare class SearchRadius {
    readonly kilometers: number;
    private constructor();
    static create(raw: number | undefined, defaultKm: number, maxKm: number): SearchRadius;
    toMeters(): number;
}
