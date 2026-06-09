import { PoiCategory, POI_CATEGORIES } from './poi-category.vo';
import { InvalidPoiCategoryError } from '../errors/domain.errors';

describe('PoiCategory', () => {
  it.each(POI_CATEGORIES)('aceita categoria MVP %s', (category) => {
    expect(PoiCategory.create(category).value).toBe(category);
  });

  it('rejeita categoria inválida', () => {
    expect(() => PoiCategory.create('restaurant')).toThrow(InvalidPoiCategoryError);
  });
});
