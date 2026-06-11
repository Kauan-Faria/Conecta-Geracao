import { Inject, Injectable } from '@nestjs/common';
import { GeocodingGateway } from '../../application/ports/maps.gateways';
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

const GOOGLE_GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

interface GoogleGeocodingResponse {
  status: string;
  results?: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  error_message?: string;
}

@Injectable()
export class HttpGoogleGeocodingGateway implements GeocodingGateway {
  constructor(
    private readonly http: MapsHttpClient,
    private readonly cache: InMemoryGeocodeCache,
    @Inject(MAPS_CONFIG) private readonly config: MapsConfig,
  ) {}

  async geocode(query: PlaceQuery): Promise<GeocodeResult | null> {
    const cacheKey = `forward:${query.value.toLowerCase()}`;
    const cached = this.cache.getForward(cacheKey, this.config.geocodeCacheTtlMs);
    if (cached) return cached;

    const url = this.buildUrl({
      address: query.value,
    });

    const result = await this.fetchGeocode(url);
    if (result) {
      this.cache.setForward(cacheKey, result, this.config.geocodeCacheTtlMs);
    }
    return result;
  }

  async reverseGeocode(point: GeoPoint): Promise<GeocodeResult | null> {
    const cacheKey = `reverse:${point.lat}:${point.lon}`;
    const cached = this.cache.getReverse(cacheKey, this.config.geocodeCacheTtlMs);
    if (cached) return cached;

    const url = this.buildUrl({
      latlng: `${point.lat},${point.lon}`,
    });

    const result = await this.fetchGeocode(url);
    if (result) {
      this.cache.setReverse(cacheKey, result, this.config.geocodeCacheTtlMs);
    }
    return result;
  }

  private buildUrl(params: Record<string, string>): string {
    const url = new URL(GOOGLE_GEOCODING_BASE_URL);
    url.searchParams.set('key', this.config.googleMapsApiKey);
    url.searchParams.set('language', 'pt-BR');
    url.searchParams.set('region', 'br');

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    if ('address' in params) {
      url.searchParams.set('components', 'country:BR');
    }

    return url.toString();
  }

  private async fetchGeocode(url: string): Promise<GeocodeResult | null> {
    let response: Response;
    try {
      response = await this.http.request(url);
    } catch (error) {
      if (error instanceof ProviderTimeoutError) {
        throw error;
      }
      throw new ExternalServiceUnavailableError('Google Maps');
    }

    this.http.assertOk(response, 'Google Maps');

    const payload = (await response.json()) as GoogleGeocodingResponse;

    if (payload.status === 'ZERO_RESULTS') {
      return null;
    }

    if (payload.status !== 'OK') {
      throw new ExternalServiceUnavailableError('Google Maps');
    }

    const item = payload.results?.[0];
    if (!item?.geometry?.location) {
      return null;
    }

    return GeocodeResult.create({
      point: GeoPoint.create(item.geometry.location.lat, item.geometry.location.lng),
      displayName: item.formatted_address,
    });
  }
}
