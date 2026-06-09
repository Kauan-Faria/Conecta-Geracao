"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageMetadata = void 0;
class MessageMetadata {
    static fromMapAction(mapAction) {
        return { map_action: mapAction.toJson() };
    }
    static isEmpty(metadata) {
        return !metadata || !metadata.map_action;
    }
}
exports.MessageMetadata = MessageMetadata;
//# sourceMappingURL=message-metadata.vo.js.map