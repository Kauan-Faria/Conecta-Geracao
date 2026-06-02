"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicSlug = exports.MVP_TOPIC_SLUGS = void 0;
const domain_errors_1 = require("../errors/domain.errors");
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
exports.MVP_TOPIC_SLUGS = [
    'fazer-pix',
    'codigo-govbr',
    'whatsapp-contato-localizacao',
    'wifi-qr-code',
    'segunda-via-boleto',
    'alerta-golpe',
];
class TopicSlug {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const normalized = raw.trim().toLowerCase();
        if (normalized.length < 3 || normalized.length > 64 || !SLUG_PATTERN.test(normalized)) {
            throw new domain_errors_1.InvalidTopicSlugError(raw);
        }
        return new TopicSlug(normalized);
    }
    equals(other) {
        return this.value === other.value;
    }
}
exports.TopicSlug = TopicSlug;
//# sourceMappingURL=topic-slug.vo.js.map