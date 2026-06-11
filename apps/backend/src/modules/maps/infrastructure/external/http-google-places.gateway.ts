import { Inject, Injectable } from '@nestjs/common';
import { PoiSearchGateway } from '../../application/ports/maps.gateways';
import {
  ExternalServiceUnavailableError,
  MapsSearchTimeoutError,
  ProviderTimeoutError,
} from '../../domain/errors/domain.errors';
import { ExternalPoiEntry } from '../../domain/services/poi-response-normalizer.service';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { MAPS_CONFIG, MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';

const GOOGLE_PLACES_SEARCH_NEARBY_URL =
  'https://places.googleapis.com/v1/places:searchNearby';

const PLACES_FIELD_MASK =
  'places.id,places.displayName,places.formattedAddress,places.location';

interface GooglePlacesSearchNearbyResponse {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: {
      latitude?: number;
      longitude?: number;
    };
  }>;
}

@Injectable()
export class HttpGooglePlacesGateway implements PoiSearchGateway {
  constructor(
    private readonly http: MapsHttpClient,
    @Inject(MAPS_CONFIG) private readonly config: MapsConfig,
  ) {}

  async searchAround(
    center: GeoPoint,
    radiusMeters: number,
    placeType: string,
  ): Promise<ExternalPoiEntry[]> {
    let response: Response;
    try {
      response = await this.http.request(GOOGLE_PLACES_SEARCH_NEARBY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.config.googleMapsApiKey,
          'X-Goog-FieldMask': PLACES_FIELD_MASK,
        },
        body: JSON.stringify({
          languageCode: 'pt-BR',
          regionCode: 'BR',
          includedTypes: [placeType],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: { latitude: center.lat, longitude: center.lon },
              radius: radiusMeters,
            },
          },
        }),
      });
    } catch (error) {
      if (error instanceof ProviderTimeoutError) {
        throw new MapsSearchTimeoutError();
      }
      throw error;
    }

    if (response.status === 504 || response.status === 429) {
      throw new MapsSearchTimeoutError();
    }

    if (!response.ok) {
      throw new ExternalServiceUnavailableError('Google Places');
    }

    const payload = (await response.json()) as GooglePlacesSearchNearbyResponse;

    return (payload.places ?? [])
      .map((item) => this.toExternalPoiEntry(item))
      .filter((entry): entry is ExternalPoiEntry => entry != null);
  }

  private toExternalPoiEntry(
    item: NonNullable<GooglePlacesSearchNearbyResponse['places']>[number],
  ): ExternalPoiEntry | null {
    const lat = item.location?.latitude;
    const lon = item.location?.longitude;

    if (lat == null || lon == null || !item.id) {
      return null;
    }

    const externalId = item.id.startsWith('places/') ? item.id.slice('places/'.length) : item.id;

    return {
      externalId,
      name: item.displayName?.text ?? '',
      address: item.formattedAddress ?? '',
      lat,
      lon,
    };
  }
}
