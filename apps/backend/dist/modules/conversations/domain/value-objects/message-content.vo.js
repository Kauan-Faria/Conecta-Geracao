"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageContent = void 0;
const domain_errors_1 = require("../errors/domain.errors");
const MIN_LENGTH = 1;
const MAX_LENGTH = 4000;
class MessageContent {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const trimmed = raw.trim();
        if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
            throw new domain_errors_1.InvalidMessageContentError(`Conteúdo deve ter entre ${MIN_LENGTH} e ${MAX_LENGTH} caracteres.`);
        }
        return new MessageContent(trimmed);
    }
}
exports.MessageContent = MessageContent;
//# sourceMappingURL=message-content.vo.js.map