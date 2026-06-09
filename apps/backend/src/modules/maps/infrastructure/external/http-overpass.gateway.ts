import { Inject, Injectable } from '@nestjs/common';
import { OverpassGateway } from '../../application/ports/maps.gateways';
import {
  OverpassTimeoutError,
  ProviderTimeoutError,
} from '../../domain/errors/domain.errors';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { OverpassElement } from '../../domain/services/osm-response-normalizer.service';
import { MAPS_CONFIG, MapsConfig } from '../config/maps.config';
import { buildOverpassQuery, MapsHttpClient } from './maps-http.client';

interface OverpassResponse {
  elements?: OverpassElement[];
}

@Injectable()
export class HttpOverpassGateway implements OverpassGateway {
  constructor(
    private readonly http: MapsHttpClient,
    @Inject(MAPS_CONFIG) private readonly config: MapsConfig,
  ) {}

  async searchAround(
    center: GeoPoint,
    radiusMeters: number,
    tagFilters: Array<Record<string, string>>,
  ): Promise<OverpassElement[]> {
    const timeoutSeconds = Math.max(1, Math.floor(this.config.httpTimeoutMs / 1000));
    const query = buildOverpassQuery(
      center.lat,
      center.lon,
      radiusMeters,
      tagFilters,
      timeoutSeconds,
    );

    let response: Response;
    try {
      response = await this.http.request(this.config.overpassBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });
    } catch (error) {
      if (error instanceof ProviderTimeoutError) {
        throw new OverpassTimeoutError();
      }
      throw error;
    }

    if (response.status === 504 || response.status === 429) {
      throw new OverpassTimeoutError();
    }

    this.http.assertOk(response, 'Overpass');

    const payload = (await response.json()) as OverpassResponse;
    return payload.elements ?? [];
  }
}
