"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicNotFoundError = exports.ContentPolicyViolationError = exports.InvalidTopicSlugError = exports.DomainError = void 0;
class DomainError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'DomainError';
    }
}
exports.DomainError = DomainError;
class InvalidTopicSlugError extends DomainError {
    constructor(slug) {
        super('INVALID_SLUG', `Slug inválido: ${slug}`);
    }
}
exports.InvalidTopicSlugError = InvalidTopicSlugError;
class ContentPolicyViolationError extends DomainError {
    constructor(message) {
        super('CONTENT_POLICY', message);
    }
}
exports.ContentPolicyViolationError = ContentPolicyViolationError;
class TopicNotFoundError extends DomainError {
    constructor(slug) {
        super('TOPIC_NOT_FOUND', `Tópico não encontrado: ${slug}`);
    }
}
exports.TopicNotFoundError = TopicNotFoundError;
//# sourceMappingURL=domain.errors.js.map