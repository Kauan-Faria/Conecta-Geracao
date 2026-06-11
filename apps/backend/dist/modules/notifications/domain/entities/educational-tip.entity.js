"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationalTip = void 0;
class EducationalTip {
    constructor(props) {
        this.id = props.id;
        this.title = props.title;
        this.body = props.body;
        this.deepLink = props.deepLink;
        this.topicTag = props.topicTag;
        this.isActive = props.isActive;
        this.sortOrder = props.sortOrder;
    }
    static reconstitute(props) {
        return new EducationalTip({
            ...props,
            topicTag: props.topicTag ?? null,
        });
    }
}
exports.EducationalTip = EducationalTip;
//# sourceMappingURL=educational-tip.entity.js.map