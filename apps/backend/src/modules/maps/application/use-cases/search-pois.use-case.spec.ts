import { SearchPoisUseCase } from './search-pois.use-case';
import { PoiCategoryMapper } from '../../domain/services/poi-category-mapper.service';
import { GeoDistanceCalculator } from '../../domain/services/geo-distance-calculator.service';
import { OsmResponseNormalizer } from '../../domain/services/osm-response-normalizer.service';
import { OverpassGateway } from '../ports/maps.gateways';
import { MapsConfig } from '../../infrastructure/config/maps.config';

const config: MapsConfig = {
  nominatimBaseUrl: 'https://nominatim.example',
  overpassBaseUrl: 'https://overpass.example',
  osrmBaseUrl: 'https://osrm.example',
  httpTimeoutMs: 25_000,
  defaultRadiusKm: 5,
  maxRadiusKm: 10,
  geocodeCacheTtlMs: 600_000,
  nominatimMinIntervalMs: 1_000,
  userAgent: 'test',
};

describe('SearchPoisUseCase', () => {
  let overpass: jest.Mocked<Pick<OverpassGateway, 'searchAround'>>;
  let useCase: SearchPoisUseCase;

  beforeEach(() => {
    overpass = {
      searchAround: jest.fn().mockResolvedValue([
        {
          type: 'node',
          id: 1,
          lat: -22.906,
          lon: -47.061,
          tags: { name: 'Farmácia' },
        },
      ]),
    };
    useCase = new SearchPoisUseCase(
      overpass as OverpassGateway,
      new PoiCategoryMapper(),
      new OsmResponseNormalizer(new GeoDistanceCalculator()),
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
    expect(overpass.searchAround).toHaveBeenCalledWith(
      expect.objectContaining({ lat: -22.9056, lon: -47.0608 }),
      5000,
      [{ amenity: 'pharmacy' }],
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

  it('retorna lista vazia quando Overpass não encontra resultados', async () => {
    overpass.searchAround.mockResolvedValue([]);
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
