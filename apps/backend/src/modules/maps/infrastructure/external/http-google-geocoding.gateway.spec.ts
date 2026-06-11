import { GeocodeResult } from '../../domain/entities/maps.entities';
import { ExternalServiceUnavailableError } from '../../domain/errors/domain.errors';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { PlaceQuery } from '../../domain/value-objects/place-query.vo';
import { InMemoryGeocodeCache } from '../cache/in-memory-geocode.cache';
import { MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';
import { HttpGoogleGeocodingGateway } from './http-google-geocoding.gateway';

const config: MapsConfig = {
  googleMapsApiKey: 'test-api-key',
  httpTimeoutMs: 5_000,
  defaultRadiusKm: 5,
  maxRadiusKm: 10,
  geocodeCacheTtlMs: 600_000,
  userAgent: 'ConectaGeracao/test',
};

function createGateway(fetchImpl: typeof fetch) {
  const http = {
    request: jest.fn((url: string) => fetchImpl(url)),
    assertOk: MapsHttpClient.prototype.assertOk.bind(MapsHttpClient.prototype),
  } as unknown as MapsHttpClient;

  return new HttpGoogleGeocodingGateway(http, new InMemoryGeocodeCache(), config);
}

describe('HttpGoogleGeocodingGateway', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('geocodifica cidade/bairro via Google Maps', async () => {
    const gateway = createGateway(async () =>
      Response.json({
        status: 'OK',
        results: [
          {
            formatted_address: 'Centro, Campinas - SP, Brasil',
            geometry: { location: { lat: -22.9056, lng: -47.0608 } },
          },
        ],
      }),
    );

    const result = await gateway.geocode(PlaceQuery.create('Centro, Campinas'));

    expect(result).toEqual(
      GeocodeResult.create({
        point: GeoPoint.create(-22.9056, -47.0608),
        displayName: 'Centro, Campinas - SP, Brasil',
      }),
    );
  });

  it('geocodifica CEP brasileiro', async () => {
    const gateway = createGateway(async (url) => {
      expect(url).toContain('address=13010-000');
      expect(url).toContain('components=country%3ABR');
      return Response.json({
        status: 'OK',
        results: [
          {
            formatted_address: '13010-000, Campinas - SP, Brasil',
            geometry: { location: { lat: -22.9064, lng: -47.0616 } },
          },
        ],
      });
    });

    const result = await gateway.geocode(PlaceQuery.create('13010-000'));

    expect(result?.displayName).toContain('Campinas');
  });

  it('retorna null quando Google não encontra lugar', async () => {
    const gateway = createGateway(async () =>
      Response.json({ status: 'ZERO_RESULTS', results: [] }),
    );

    await expect(gateway.geocode(PlaceQuery.create('xyz inexistente'))).resolves.toBeNull();
  });

  it('faz reverse geocode por coordenadas', async () => {
    const gateway = createGateway(async (url) => {
      expect(url).toContain('latlng=-22.9056%2C-47.0608');
      return Response.json({
        status: 'OK',
        results: [
          {
            formatted_address: 'Centro, Campinas - SP, Brasil',
            geometry: { location: { lat: -22.9056, lng: -47.0608 } },
          },
        ],
      });
    });

    const result = await gateway.reverseGeocode(GeoPoint.create(-22.9056, -47.0608));

    expect(result?.displayName).toBe('Centro, Campinas - SP, Brasil');
  });

  it('lança erro quando Google retorna status inválido', async () => {
    const gateway = createGateway(async () =>
      Response.json({ status: 'REQUEST_DENIED', error_message: 'Invalid key' }),
    );

    await expect(gateway.geocode(PlaceQuery.create('Campinas'))).rejects.toBeInstanceOf(
      ExternalServiceUnavailableError,
    );
  });
});
