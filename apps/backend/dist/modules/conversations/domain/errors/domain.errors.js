"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTopicSlugRefError = exports.InvalidMessageContentError = exports.ConversationClosedError = exports.ConversationNotFoundError = exports.DomainError = void 0;
class DomainError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'DomainError';
    }
}
exports.DomainError = DomainError;
class ConversationNotFoundError extends DomainError {
    constructor() {
        super('CONVERSATION_NOT_FOUND', 'Conversa não encontrada.');
    }
}
exports.ConversationNotFoundError = ConversationNotFoundError;
class ConversationClosedError extends DomainError {
    constructor() {
        super('CONVERSATION_CLOSED', 'Esta conversa já foi encerrada.');
    }
}
exports.ConversationClosedError = ConversationClosedError;
class InvalidMessageContentError extends DomainError {
    constructor(message = 'Conteúdo da mensagem inválido.') {
        super('INVALID_MESSAGE_CONTENT', message);
    }
}
exports.InvalidMessageContentError = InvalidMessageContentError;
class InvalidTopicSlugRefError extends DomainError {
    constructor(slug) {
        super('INVALID_TOPIC_SLUG', `Slug de tópico inválido: ${slug}`);
    }
}
exports.InvalidTopicSlugRefError = InvalidTopicSlugRefError;
//# sourceMappingURL=domain.errors.js.map