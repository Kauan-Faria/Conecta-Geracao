import { Inject, Injectable } from '@nestjs/common';
import { NominatimGateway } from '../../application/ports/maps.gateways';
import { GeocodeResult } from '../../domain/entities/maps.entities';
import {
  ExternalServiceUnavailableError,
  ProviderTimeoutError,
} from '../../domain/errors/domain.errors';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { PlaceQuery } from '../../domain/value-objects/place-query.vo';
import { InMemoryGeocodeCache } from '../cache/in-memory-geocode.cache';
import { MAPS_CONFIG, MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

@Injectable()
export class HttpNominatimGateway implements NominatimGateway {
  private lastRequestAt = 0;

  constructor(
    private readonly http: MapsHttpClient,
    private readonly cache: InMemoryGeocodeCache,
    @Inject(MAPS_CONFIG) private readonly config: MapsConfig,
  ) {}

  async geocode(query: PlaceQuery): Promise<GeocodeResult | null> {
    const cacheKey = `forward:${query.value.toLowerCase()}`;
    const cached = this.cache.getForward(cacheKey, this.config.geocodeCacheTtlMs);
    if (cached) return cached;

    const url = new URL('/search', this.config.nominatimBaseUrl);
    url.searchParams.set('q', query.value);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('addressdetails', '1');

    const result = await this.fetchGeocode(url.toString());
    if (result) {
      this.cache.setForward(cacheKey, result, this.config.geocodeCacheTtlMs);
    }
    return result;
  }

  async reverseGeocode(point: GeoPoint): Promise<GeocodeResult | null> {
    const cacheKey = `reverse:${point.lat}:${point.lon}`;
    const cached = this.cache.getReverse(cacheKey, this.config.geocodeCacheTtlMs);
    if (cached) return cached;

    const url = new URL('/reverse', this.config.nominatimBaseUrl);
    url.searchParams.set('lat', String(point.lat));
    url.searchParams.set('lon', String(point.lon));
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');

    const result = await this.fetchGeocode(url.toString());
    if (result) {
      this.cache.setReverse(cacheKey, result, this.config.geocodeCacheTtlMs);
    }
    return result;
  }

  private async fetchGeocode(url: string): Promise<GeocodeResult | null> {
    await this.waitForThrottle();

    let response: Response;
    try {
      response = await this.http.request(url, {
        headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
      });
    } catch (error) {
      if (error instanceof ProviderTimeoutError) {
        throw error;
      }
      throw new ExternalServiceUnavailableError('Nominatim');
    }

    if (response.status === 404) {
      return null;
    }

    this.http.assertOk(response, 'Nominatim');

    const payload = (await response.json()) as NominatimSearchResult | NominatimSearchResult[];
    const item = Array.isArray(payload) ? payload[0] : payload;

    if (!item?.lat || !item?.lon) {
      return null;
    }

    return GeocodeResult.create({
      point: GeoPoint.create(Number.parseFloat(item.lat), Number.parseFloat(item.lon)),
      displayName: item.display_name,
    });
  }

  private async waitForThrottle(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestAt;
    const waitMs = this.config.nominatimMinIntervalMs - elapsed;
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    this.lastRequestAt = Date.now();
  }
}
