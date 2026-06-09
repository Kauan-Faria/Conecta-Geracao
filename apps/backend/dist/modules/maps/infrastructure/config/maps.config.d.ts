export declare const MAPS_CONFIG: unique symbol;
export interface MapsConfig {
    nominatimBaseUrl: string;
    overpassBaseUrl: string;
    osrmBaseUrl: string;
    httpTimeoutMs: number;
    defaultRadiusKm: number;
    maxRadiusKm: number;
    geocodeCacheTtlMs: number;
    nominatimMinIntervalMs: number;
    userAgent: string;
}
export declare function createMapsConfigFromEnv(): MapsConfig;
