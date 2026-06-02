"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationStatus = void 0;
class ConversationStatus {
    constructor(value) {
        this.value = value;
    }
    static inProgress() {
        return new ConversationStatus('in_progress');
    }
    static completed() {
        return new ConversationStatus('completed');
    }
    static from(value) {
        return new ConversationStatus(value);
    }
    isInProgress() {
        return this.value === 'in_progress';
    }
}
exports.ConversationStatus = ConversationStatus;
//# sourceMappingURL=conversation-status.vo.js.map