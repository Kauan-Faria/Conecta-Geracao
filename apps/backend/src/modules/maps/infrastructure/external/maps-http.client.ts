import { Inject, Injectable } from '@nestjs/common';
import {
  ExternalServiceUnavailableError,
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
    if (url.includes('places.googleapis.com')) return 'Google Places';
    if (url.includes('routes.googleapis.com')) return 'Google Routes';
    if (url.includes('googleapis.com/maps/api/geocode')) return 'Google Maps';
    return 'maps';
  }
}
