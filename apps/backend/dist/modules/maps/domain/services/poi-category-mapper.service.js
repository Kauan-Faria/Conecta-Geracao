"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoiCategoryMapper = void 0;
class PoiCategoryMapper {
    toOverpassFilters(category) {
        return CATEGORY_FILTERS[category.value];
    }
}
exports.PoiCategoryMapper = PoiCategoryMapper;
const CATEGORY_FILTERS = {
    pharmacy: [{ amenity: 'pharmacy' }],
    health_post: [
        { amenity: 'clinic' },
        { healthcare: 'centre' },
        { amenity: 'health_post' },
    ],
    hospital: [{ amenity: 'hospital' }, { emergency: 'emergency_ward_entrance' }],
    bank: [{ amenity: 'bank' }, { amenity: 'bureau_de_change' }, { shop: 'lottery' }],
    post_office: [{ amenity: 'post_office' }],
    supermarket: [{ shop: 'supermarket' }],
};
//# sourceMappingURL=poi-category-mapper.service.js.map