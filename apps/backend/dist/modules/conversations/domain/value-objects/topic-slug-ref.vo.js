"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicSlugRef = void 0;
const domain_errors_1 = require("../errors/domain.errors");
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
class TopicSlugRef {
    constructor(value) {
        this.value = value;
    }
    static createOptional(raw) {
        if (raw === undefined || raw === null || raw.trim() === '') {
            return null;
        }
        const normalized = raw.trim().toLowerCase();
        if (normalized.length < 3 || normalized.length > 64 || !SLUG_PATTERN.test(normalized)) {
            throw new domain_errors_1.InvalidTopicSlugRefError(raw);
        }
        return new TopicSlugRef(normalized);
    }
}
exports.TopicSlugRef = TopicSlugRef;
//# sourceMappingURL=topic-slug-ref.vo.js.map