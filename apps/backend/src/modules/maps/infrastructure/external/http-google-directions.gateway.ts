import { Inject, Injectable } from '@nestjs/common';
import { RouteGateway } from '../../application/ports/maps.gateways';
import { RouteResult } from '../../domain/entities/maps.entities';
import {
  ExternalServiceUnavailableError,
  ProviderTimeoutError,
} from '../../domain/errors/domain.errors';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { MAPS_CONFIG, MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';

const GOOGLE_ROUTES_COMPUTE_URL =
  'https://routes.googleapis.com/directions/v2:computeRoutes';

const ROUTES_FIELD_MASK =
  'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline';

interface GoogleRoutesResponse {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
    polyline?: { encodedPolyline?: string };
  }>;
}

@Injectable()
export class HttpGoogleDirectionsGateway implements RouteGateway {
  constructor(
    private readonly http: MapsHttpClient,
    @Inject(MAPS_CONFIG) private readonly config: MapsConfig,
  ) {}

  async getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult | null> {
    let response: Response;
    try {
      response = await this.http.request(GOOGLE_ROUTES_COMPUTE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.config.googleMapsApiKey,
          'X-Goog-FieldMask': ROUTES_FIELD_MASK,
        },
        body: JSON.stringify({
          origin: {
            location: { latLng: { latitude: origin.lat, longitude: origin.lon } },
          },
          destination: {
            location: {
              latLng: { latitude: destination.lat, longitude: destination.lon },
            },
          },
          travelMode: 'DRIVE',
          languageCode: 'pt-BR',
          units: 'METRIC',
        }),
      });
    } catch (error) {
      if (error instanceof ProviderTimeoutError) {
        throw error;
      }
      throw new ExternalServiceUnavailableError('Google Routes');
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new ExternalServiceUnavailableError('Google Routes');
    }

    const payload = (await response.json()) as GoogleRoutesResponse;
    const route = payload.routes?.[0];
    const polyline = route?.polyline?.encodedPolyline;

    if (!polyline || route.distanceMeters == null || !route.duration) {
      return null;
    }

    const durationSeconds = this.parseDurationSeconds(route.duration);
    if (durationSeconds == null) {
      return null;
    }

    return RouteResult.create({
      polyline,
      distanceMeters: route.distanceMeters,
      durationSeconds,
    });
  }

  private parseDurationSeconds(duration: string): number | null {
    const match = /^(\d+)s$/.exec(duration.trim());
    if (!match) return null;
    return Number.parseInt(match[1], 10);
  }
}
