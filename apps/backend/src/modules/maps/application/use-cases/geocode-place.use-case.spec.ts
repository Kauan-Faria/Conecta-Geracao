import { GeocodePlaceUseCase } from './geocode-place.use-case';
import { GeocodeResult } from '../../domain/entities/maps.entities';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { GeocodingGateway } from '../ports/maps.gateways';

describe('GeocodePlaceUseCase', () => {
  const geocodeResult = GeocodeResult.create({
    point: GeoPoint.create(-22.9056, -47.0608),
    displayName: 'Centro, Campinas - SP, Brasil',
  });

  it('retorna coordenadas quando Google Maps encontra lugar', async () => {
    const geocoding: Pick<GeocodingGateway, 'geocode'> = {
      geocode: jest.fn().mockResolvedValue(geocodeResult),
    };
    const useCase = new GeocodePlaceUseCase(geocoding as GeocodingGateway);

    const result = await useCase.execute('Centro, Campinas');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.displayName).toContain('Campinas');
    }
  });

  it('retorna erro quando lugar não é encontrado', async () => {
    const geocoding: Pick<GeocodingGateway, 'geocode'> = {
      geocode: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GeocodePlaceUseCase(geocoding as GeocodingGateway);

    const result = await useCase.execute('xyz inexistente');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PLACE_NOT_FOUND');
    }
  });
});
