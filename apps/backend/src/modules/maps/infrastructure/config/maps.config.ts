export const MAPS_CONFIG = Symbol('MAPS_CONFIG');

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

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function createMapsConfigFromEnv(): MapsConfig {
  return {
    nominatimBaseUrl:
      process.env.NOMINATIM_BASE_URL?.trim() || 'https://nominatim.openstreetmap.org',
    overpassBaseUrl:
      process.env.OVERPASS_BASE_URL?.trim() ||
      'https://overpass-api.de/api/interpreter',
    osrmBaseUrl:
      process.env.OSRM_BASE_URL?.trim() || 'https://router.project-osrm.org',
    httpTimeoutMs: parsePositiveInt(process.env.MAPS_HTTP_TIMEOUT_MS, 25_000),
    defaultRadiusKm: parsePositiveInt(process.env.MAPS_DEFAULT_RADIUS_KM, 5),
    maxRadiusKm: parsePositiveInt(process.env.MAPS_MAX_RADIUS_KM, 10),
    geocodeCacheTtlMs: 600_000,
    nominatimMinIntervalMs: 1_000,
    userAgent:
      process.env.MAPS_USER_AGENT?.trim() ||
      'ConectaGeracao/1.0 (contact@conectageracao.app)',
  };
}
