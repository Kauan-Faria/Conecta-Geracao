"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapAction = exports.MAP_SEARCH_TYPE = void 0;
exports.MAP_SEARCH_TYPE = 'map_search';
class MapAction {
    constructor(category, radius, center) {
        this.type = exports.MAP_SEARCH_TYPE;
        this.category = category;
        this.radius = radius;
        this.center = center ?? null;
    }
    static create(params) {
        return new MapAction(params.category, params.radius, params.center);
    }
    toJson() {
        const json = {
            type: this.type,
            category: this.category.value,
            radiusKm: this.radius.kilometers,
        };
        if (this.center) {
            json.center = { lat: this.center.lat, lon: this.center.lon };
        }
        return json;
    }
}
exports.MapAction = MapAction;
//# sourceMappingURL=map-action.vo.js.map