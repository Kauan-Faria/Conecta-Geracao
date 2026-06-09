"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchQuery = void 0;
const domain_errors_1 = require("../errors/domain.errors");
class SearchQuery {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const trimmed = raw.trim();
        if (trimmed.length < 2) {
            throw new domain_errors_1.InvalidSearchQueryError();
        }
        if (trimmed.length > 100) {
            throw new domain_errors_1.InvalidSearchQueryError('Busca deve ter no máximo 100 caracteres');
        }
        return new SearchQuery(trimmed);
    }
}
exports.SearchQuery = SearchQuery;
//# sourceMappingURL=search-query.vo.js.map