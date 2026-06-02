"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationOwnershipPolicy = void 0;
const domain_errors_1 = require("../errors/domain.errors");
class ConversationOwnershipPolicy {
    assertOwner(conversation, firebaseUid) {
        if (!conversation || conversation.firebaseUid !== firebaseUid) {
            throw new domain_errors_1.ConversationNotFoundError();
        }
        return conversation;
    }
}
exports.ConversationOwnershipPolicy = ConversationOwnershipPolicy;
//# sourceMappingURL=conversation-ownership.policy.js.map