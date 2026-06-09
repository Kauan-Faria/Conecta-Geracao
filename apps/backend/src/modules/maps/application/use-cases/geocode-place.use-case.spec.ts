import { GeocodePlaceUseCase } from './geocode-place.use-case';
import { GeocodeResult } from '../../domain/entities/maps.entities';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { NominatimGateway } from '../ports/maps.gateways';

describe('GeocodePlaceUseCase', () => {
  const geocodeResult = GeocodeResult.create({
    point: GeoPoint.create(-22.9056, -47.0608),
    displayName: 'Centro, Campinas',
  });

  it('retorna coordenadas quando Nominatim encontra lugar', async () => {
    const nominatim: Pick<NominatimGateway, 'geocode'> = {
      geocode: jest.fn().mockResolvedValue(geocodeResult),
    };
    const useCase = new GeocodePlaceUseCase(nominatim as NominatimGateway);

    const result = await useCase.execute('Centro, Campinas');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.displayName).toBe('Centro, Campinas');
    }
  });

  it('retorna erro quando lugar não encontrado', async () => {
    const nominatim: Pick<NominatimGateway, 'geocode'> = {
      geocode: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GeocodePlaceUseCase(nominatim as NominatimGateway);

    const result = await useCase.execute('Lugar Inexistente XYZ');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PLACE_NOT_FOUND');
    }
  });
});
