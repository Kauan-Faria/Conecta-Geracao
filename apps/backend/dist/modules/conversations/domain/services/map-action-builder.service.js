"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapActionBuilder = void 0;
const map_action_vo_1 = require("../value-objects/map-action.vo");
class MapActionBuilder {
    build(params) {
        return map_action_vo_1.MapAction.create(params);
    }
}
exports.MapActionBuilder = MapActionBuilder;
//# sourceMappingURL=map-action-builder.service.js.map