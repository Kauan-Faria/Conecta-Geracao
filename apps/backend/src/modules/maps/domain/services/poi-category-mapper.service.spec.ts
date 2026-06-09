import { PoiCategory } from '../value-objects/poi-category.vo';
import { PoiCategoryMapper } from './poi-category-mapper.service';
import { buildOverpassQuery } from '../../infrastructure/external/maps-http.client';

describe('PoiCategoryMapper', () => {
  const mapper = new PoiCategoryMapper();

  it('mapeia pharmacy para amenity=pharmacy', () => {
    const filters = mapper.toOverpassFilters(PoiCategory.create('pharmacy'));
    expect(filters).toEqual([{ amenity: 'pharmacy' }]);
  });

  it('mapeia health_post com múltiplos filtros', () => {
    const filters = mapper.toOverpassFilters(PoiCategory.create('health_post'));
    expect(filters).toHaveLength(3);
    expect(filters).toContainEqual({ amenity: 'clinic' });
  });

  it('gera query Overpass com raio correto', () => {
    const filters = mapper.toOverpassFilters(PoiCategory.create('pharmacy'));
    const query = buildOverpassQuery(-22.9, -47.0, 5000, filters, 25);
    expect(query).toContain('around:5000,-22.9,-47');
    expect(query).toContain('["amenity"="pharmacy"]');
  });
});
