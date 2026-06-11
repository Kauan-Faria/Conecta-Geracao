"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoiCategoryMapper = void 0;
class PoiCategoryMapper {
    toGooglePlaceType(category) {
        return GOOGLE_PLACE_TYPES[category.value];
    }
}
exports.PoiCategoryMapper = PoiCategoryMapper;
const GOOGLE_PLACE_TYPES = {
    pharmacy: 'pharmacy',
    health_post: 'doctor',
    hospital: 'hospital',
    bank: 'bank',
    post_office: 'post_office',
    supermarket: 'supermarket',
};
//# sourceMappingURL=poi-category-mapper.service.js.map