import { ExternalServiceUnavailableError, MapsSearchTimeoutError } from '../../domain/errors/domain.errors';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';
import { HttpGooglePlacesGateway } from './http-google-places.gateway';

const config: MapsConfig = {
  googleMapsApiKey: 'test-api-key',
  httpTimeoutMs: 5_000,
  defaultRadiusKm: 5,
  maxRadiusKm: 10,
  geocodeCacheTtlMs: 600_000,
  userAgent: 'ConectaGeracao/test',
};

function createGateway(fetchImpl: (url: string, init?: RequestInit) => Promise<Response>) {
  const http = {
    request: jest.fn((url: string, init?: RequestInit) => fetchImpl(url, init)),
    assertOk: MapsHttpClient.prototype.assertOk.bind(MapsHttpClient.prototype),
  } as unknown as MapsHttpClient;

  return new HttpGooglePlacesGateway(http, config);
}

describe('HttpGooglePlacesGateway', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('busca POIs via Places API (New) por type e raio', async () => {
    const gateway = createGateway(async (url, init) => {
      expect(url).toBe('https://places.googleapis.com/v1/places:searchNearby');
      const body = JSON.parse(String(init?.body));
      expect(body.includedTypes).toEqual(['pharmacy']);
      expect(body.locationRestriction.circle.radius).toBe(5000);
      expect(init?.headers).toMatchObject({
        'X-Goog-Api-Key': 'test-api-key',
      });
      return Response.json({
        places: [
          {
            id: 'places/ChIJ123',
            displayName: { text: 'Farmácia Central' },
            formattedAddress: 'Rua Exemplo, 100',
            location: { latitude: -22.906, longitude: -47.061 },
          },
        ],
      });
    });

    const results = await gateway.searchAround(GeoPoint.create(-22.9056, -47.0608), 5000, 'pharmacy');

    expect(results).toEqual([
      {
        externalId: 'ChIJ123',
        name: 'Farmácia Central',
        address: 'Rua Exemplo, 100',
        lat: -22.906,
        lon: -47.061,
      },
    ]);
  });

  it('retorna lista vazia quando Google não encontra POIs', async () => {
    const gateway = createGateway(async () => Response.json({ places: [] }));

    await expect(
      gateway.searchAround(GeoPoint.create(-22.9056, -47.0608), 5000, 'pharmacy'),
    ).resolves.toEqual([]);
  });

  it('lança timeout quando serviço demora demais', async () => {
    const gateway = createGateway(async () => new Response(null, { status: 504 }));

    await expect(
      gateway.searchAround(GeoPoint.create(-22.9056, -47.0608), 5000, 'pharmacy'),
    ).rejects.toBeInstanceOf(MapsSearchTimeoutError);
  });

  it('lança erro quando Google retorna erro HTTP', async () => {
    const gateway = createGateway(async () =>
      Response.json({ error: { message: 'PERMISSION_DENIED' } }, { status: 403 }),
    );

    await expect(
      gateway.searchAround(GeoPoint.create(-22.9056, -47.0608), 5000, 'pharmacy'),
    ).rejects.toBeInstanceOf(ExternalServiceUnavailableError);
  });
});
