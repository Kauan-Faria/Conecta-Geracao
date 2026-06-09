import { Inject, Injectable } from '@nestjs/common';
import {
  ExternalServiceUnavailableError,
  OverpassTimeoutError,
  ProviderTimeoutError,
} from '../../domain/errors/domain.errors';
import { MAPS_CONFIG, MapsConfig } from '../config/maps.config';

@Injectable()
export class MapsHttpClient {
  constructor(@Inject(MAPS_CONFIG) private readonly config: MapsConfig) {}

  async request(url: string, init: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.httpTimeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'User-Agent': this.config.userAgent,
          Accept: 'application/json',
          ...init.headers,
        },
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ProviderTimeoutError(this.serviceFromUrl(url));
      }
      throw new ExternalServiceUnavailableError(this.serviceFromUrl(url));
    } finally {
      clearTimeout(timeout);
    }
  }

  assertOk(response: Response, service: string): void {
    if (response.status >= 500) {
      throw new ExternalServiceUnavailableError(service);
    }
  }

  private serviceFromUrl(url: string): string {
    if (url.includes('overpass')) return 'Overpass';
    if (url.includes('nominatim') || url.includes('openstreetmap.org')) return 'Nominatim';
    if (url.includes('osrm') || url.includes('router.project-osrm')) return 'OSRM';
    return 'maps';
  }
}

export function buildOverpassQuery(
  lat: number,
  lon: number,
  radiusMeters: number,
  tagFilters: Array<Record<string, string>>,
  timeoutSeconds: number,
): string {
  const conditions = tagFilters
    .flatMap((tags) => {
      const tagString = Object.entries(tags)
        .map(([key, value]) => `["${key}"="${value}"]`)
        .join('');
      return [
        `  node${tagString}(around:${radiusMeters},${lat},${lon});`,
        `  way${tagString}(around:${radiusMeters},${lat},${lon});`,
      ];
    })
    .join('\n');

  return `[out:json][timeout:${timeoutSeconds}];\n(\n${conditions}\n);\nout center tags;`;
}
