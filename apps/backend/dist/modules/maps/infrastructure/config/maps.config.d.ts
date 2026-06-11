export declare const MAPS_CONFIG: unique symbol;
export interface MapsConfig {
    googleMapsApiKey: string;
    httpTimeoutMs: number;
    defaultRadiusKm: number;
    maxRadiusKm: number;
    geocodeCacheTtlMs: number;
    userAgent: string;
}
export declare function createMapsConfigFromEnv(): MapsConfig;
