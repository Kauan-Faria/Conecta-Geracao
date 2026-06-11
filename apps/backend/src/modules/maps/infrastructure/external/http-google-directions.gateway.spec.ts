import { ExternalServiceUnavailableError } from '../../domain/errors/domain.errors';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { MapsConfig } from '../config/maps.config';
import { MapsHttpClient } from './maps-http.client';
import { HttpGoogleDirectionsGateway } from './http-google-directions.gateway';

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

  return new HttpGoogleDirectionsGateway(http, config);
}

describe('HttpGoogleDirectionsGateway', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retorna rota via Routes API com polyline, distância e duração', async () => {
    const gateway = createGateway(async (url, init) => {
      expect(url).toBe('https://routes.googleapis.com/directions/v2:computeRoutes');
      const body = JSON.parse(String(init?.body));
      expect(body.travelMode).toBe('DRIVE');
      return Response.json({
        routes: [
          {
            distanceMeters: 1250,
            duration: '180s',
            polyline: { encodedPolyline: 'encodedPolyline' },
          },
        ],
      });
    });

    const result = await gateway.getRoute(
      GeoPoint.create(-22.9056, -47.0608),
      GeoPoint.create(-22.91, -47.065),
    );

    expect(result).toEqual({
      polyline: 'encodedPolyline',
      distanceMeters: 1250,
      durationSeconds: 180,
    });
  });

  it('retorna null quando Google não encontra rota', async () => {
    const gateway = createGateway(async () => Response.json({ routes: [] }));

    await expect(
      gateway.getRoute(
        GeoPoint.create(-22.9056, -47.0608),
        GeoPoint.create(-22.91, -47.065),
      ),
    ).resolves.toBeNull();
  });

  it('lança erro quando Google retorna erro HTTP', async () => {
    const gateway = createGateway(async () =>
      Response.json({ error: { message: 'PERMISSION_DENIED' } }, { status: 403 }),
    );

    await expect(
      gateway.getRoute(
        GeoPoint.create(-22.9056, -47.0608),
        GeoPoint.create(-22.91, -47.065),
      ),
    ).rejects.toBeInstanceOf(ExternalServiceUnavailableError);
  });
});
