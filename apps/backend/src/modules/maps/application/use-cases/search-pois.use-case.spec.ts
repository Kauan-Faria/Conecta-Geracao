import { SearchPoisUseCase } from './search-pois.use-case';
import { PoiCategoryMapper } from '../../domain/services/poi-category-mapper.service';
import { GeoDistanceCalculator } from '../../domain/services/geo-distance-calculator.service';
import { PoiResponseNormalizer } from '../../domain/services/poi-response-normalizer.service';
import { PoiSearchGateway } from '../ports/maps.gateways';
import { MapsConfig } from '../../infrastructure/config/maps.config';

const config: MapsConfig = {
  googleMapsApiKey: 'test-api-key',
  httpTimeoutMs: 25_000,
  defaultRadiusKm: 5,
  maxRadiusKm: 10,
  geocodeCacheTtlMs: 600_000,
  userAgent: 'test',
};

describe('SearchPoisUseCase', () => {
  let poiSearch: jest.Mocked<Pick<PoiSearchGateway, 'searchAround'>>;
  let useCase: SearchPoisUseCase;

  beforeEach(() => {
    poiSearch = {
      searchAround: jest.fn().mockResolvedValue([
        {
          externalId: 'ChIJ123',
          name: 'Farmácia',
          address: 'Rua A',
          lat: -22.906,
          lon: -47.061,
        },
      ]),
    };
    useCase = new SearchPoisUseCase(
      poiSearch as PoiSearchGateway,
      new PoiCategoryMapper(),
      new PoiResponseNormalizer(new GeoDistanceCalculator()),
      config,
    );
  });

  it('retorna POIs ordenados por distância', async () => {
    const result = await useCase.execute({
      lat: -22.9056,
      lon: -47.0608,
      category: 'pharmacy',
      radiusKm: 5,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.results).toHaveLength(1);
      expect(result.value.category.value).toBe('pharmacy');
      expect(result.value.radius.kilometers).toBe(5);
    }
    expect(poiSearch.searchAround).toHaveBeenCalledWith(
      expect.objectContaining({ lat: -22.9056, lon: -47.0608 }),
      5000,
      'pharmacy',
    );
  });

  it('retorna erro para categoria inválida', async () => {
    const result = await useCase.execute({
      lat: -22.9056,
      lon: -47.0608,
      category: 'invalid',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_POI_CATEGORY');
    }
  });

  it('retorna lista vazia quando Google Places não encontra resultados', async () => {
    poiSearch.searchAround.mockResolvedValue([]);
    const result = await useCase.execute({
      lat: -22.9056,
      lon: -47.0608,
      category: 'pharmacy',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.results).toEqual([]);
    }
  });
});
