"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = exports.Message = void 0;
const domain_errors_1 = require("../errors/domain.errors");
const conversation_status_vo_1 = require("../value-objects/conversation-status.vo");
class Message {
    constructor(props) {
        this.id = props.id;
        this.conversationId = props.conversationId;
        this.role = props.role;
        this.content = props.content;
        this.createdAt = props.createdAt ?? new Date();
    }
    static create(props) {
        return new Message(props);
    }
}
exports.Message = Message;
class Conversation {
    constructor(props) {
        this.id = props.id;
        this.firebaseUid = props.firebaseUid;
        this.topicSlug = props.topicSlug ?? null;
        this.status = props.status ?? conversation_status_vo_1.ConversationStatus.inProgress();
        this.currentStep = props.currentStep ?? 0;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
        this.messages = props.messages ?? [];
    }
    static create(props) {
        if (!props.firebaseUid.trim()) {
            throw new Error('firebaseUid é obrigatório');
        }
        return new Conversation(props);
    }
    assertCanReceiveMessage() {
        if (!this.status.isInProgress()) {
            throw new domain_errors_1.ConversationClosedError();
        }
    }
    withMessages(messages) {
        return new Conversation({
            id: this.id,
            firebaseUid: this.firebaseUid,
            topicSlug: this.topicSlug,
            status: this.status,
            currentStep: this.currentStep,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            messages,
        });
    }
}
exports.Conversation = Conversation;
//# sourceMappingURL=conversation.entity.js.map