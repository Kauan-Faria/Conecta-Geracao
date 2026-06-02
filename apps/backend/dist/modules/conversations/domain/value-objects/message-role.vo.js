"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRole = void 0;
class MessageRole {
    constructor(value) {
        this.value = value;
    }
    static user() {
        return new MessageRole('user');
    }
    static assistant() {
        return new MessageRole('assistant');
    }
    static from(value) {
        return new MessageRole(value);
    }
}
exports.MessageRole = MessageRole;
//# sourceMappingURL=message-role.vo.js.map