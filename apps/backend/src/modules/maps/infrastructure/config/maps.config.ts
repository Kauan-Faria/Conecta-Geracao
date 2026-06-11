export const MAPS_CONFIG = Symbol('MAPS_CONFIG');

export interface MapsConfig {
  googleMapsApiKey: string;
  httpTimeoutMs: number;
  defaultRadiusKm: number;
  maxRadiusKm: number;
  geocodeCacheTtlMs: number;
  userAgent: string;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function createMapsConfigFromEnv(): MapsConfig {
  return {
    googleMapsApiKey: process.env.GOOGLEMAPS_API_KEY?.trim() ?? '',
    httpTimeoutMs: parsePositiveInt(process.env.MAPS_HTTP_TIMEOUT_MS, 25_000),
    defaultRadiusKm: parsePositiveInt(process.env.MAPS_DEFAULT_RADIUS_KM, 5),
    maxRadiusKm: parsePositiveInt(process.env.MAPS_MAX_RADIUS_KM, 10),
    geocodeCacheTtlMs: 600_000,
    userAgent:
      process.env.MAPS_USER_AGENT?.trim() ||
      'ConectaGeracao/1.0 (contact@conectageracao.app)',
  };
}
