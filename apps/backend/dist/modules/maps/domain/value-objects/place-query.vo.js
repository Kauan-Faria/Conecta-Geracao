"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceQuery = void 0;
const domain_errors_1 = require("../errors/domain.errors");
class PlaceQuery {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const trimmed = raw.trim();
        if (trimmed.length < 2) {
            throw new domain_errors_1.InvalidPlaceQueryError('Consulta deve ter pelo menos 2 caracteres');
        }
        if (trimmed.length > 200) {
            throw new domain_errors_1.InvalidPlaceQueryError('Consulta deve ter no máximo 200 caracteres');
        }
        return new PlaceQuery(trimmed);
    }
}
exports.PlaceQuery = PlaceQuery;
//# sourceMappingURL=place-query.vo.js.map