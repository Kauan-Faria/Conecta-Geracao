"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoiCategory = exports.POI_CATEGORIES = void 0;
const domain_errors_1 = require("../errors/domain.errors");
exports.POI_CATEGORIES = [
    'pharmacy',
    'health_post',
    'hospital',
    'bank',
    'post_office',
    'supermarket',
];
class PoiCategory {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const normalized = raw.trim();
        if (!exports.POI_CATEGORIES.includes(normalized)) {
            throw new domain_errors_1.InvalidPoiCategoryError(raw);
        }
        return new PoiCategory(normalized);
    }
}
exports.PoiCategory = PoiCategory;
//# sourceMappingURL=poi-category.vo.js.map