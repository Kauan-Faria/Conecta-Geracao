"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginated = paginated;
exports.isPaginatedPayload = isPaginatedPayload;
function paginated(items, page, limit, total) {
    return { paginated: true, items, page, limit, total };
}
function isPaginatedPayload(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'paginated' in value &&
        value.paginated === true);
}
//# sourceMappingURL=paginated-response.js.map