import { PoiCategoryMapper } from './poi-category-mapper.service';
import { PoiCategory } from '../value-objects/poi-category.vo';

describe('PoiCategoryMapper', () => {
  const mapper = new PoiCategoryMapper();

  it('mapeia pharmacy para type Google Places', () => {
    expect(mapper.toGooglePlaceType(PoiCategory.create('pharmacy'))).toBe('pharmacy');
  });

  it('mapeia health_post para type Google Places', () => {
    expect(mapper.toGooglePlaceType(PoiCategory.create('health_post'))).toBe('doctor');
  });

  it('mapeia hospital para type Google Places', () => {
    expect(mapper.toGooglePlaceType(PoiCategory.create('hospital'))).toBe('hospital');
  });

  it('mapeia bank para type Google Places', () => {
    expect(mapper.toGooglePlaceType(PoiCategory.create('bank'))).toBe('bank');
  });

  it('mapeia post_office para type Google Places', () => {
    expect(mapper.toGooglePlaceType(PoiCategory.create('post_office'))).toBe('post_office');
  });

  it('mapeia supermarket para type Google Places', () => {
    expect(mapper.toGooglePlaceType(PoiCategory.create('supermarket'))).toBe('supermarket');
  });
});
