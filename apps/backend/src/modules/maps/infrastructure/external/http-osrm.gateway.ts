import { Inject, Injectable } from '@nestjs/common';
import { OsrmGateway } from '../../application/ports/maps.gateways';
import { RouteResult } from '../../domain/entities/maps.entities';
import {
  ExternalServiceUnavailableError,
  ProviderTimeoutError,
} from '../../domain/errors/domain.errors';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { MAPS_CONFIG, MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';

interface OsrmRouteResponse {
  routes?: Array<{
    geometry?: string;
    distance?: number;
    duration?: number;
  }>;
  code?: string;
}

@Injectable()
export class HttpOsrmGateway implements OsrmGateway {
  constructor(
    private readonly http: MapsHttpClient,
    @Inject(MAPS_CONFIG) private readonly config: MapsConfig,
  ) {}

  async getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult | null> {
    const path = `/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
    const url = new URL(path, this.config.osrmBaseUrl);
    url.searchParams.set('overview', 'full');
    url.searchParams.set('geometries', 'polyline');
    url.searchParams.set('steps', 'false');

    let response: Response;
    try {
      response = await this.http.request(url.toString());
    } catch (error) {
      if (error instanceof ProviderTimeoutError) {
        throw error;
      }
      throw new ExternalServiceUnavailableError('OSRM');
    }

    if (response.status === 404) {
      return null;
    }

    this.http.assertOk(response, 'OSRM');

    const payload = (await response.json()) as OsrmRouteResponse;
    const route = payload.routes?.[0];

    if (!route?.geometry || route.distance == null || route.duration == null) {
      return null;
    }

    return RouteResult.create({
      polyline: route.geometry,
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
    });
  }
}
