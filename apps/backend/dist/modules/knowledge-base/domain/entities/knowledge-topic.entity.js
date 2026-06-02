"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeTopic = void 0;
const knowledge_step_entity_1 = require("./knowledge-step.entity");
class KnowledgeTopic {
    constructor(props) {
        this.id = props.id;
        this.slug = props.slug;
        this.title = props.title;
        this.summary = props.summary;
        this.keywords = props.keywords;
        this.displayOrder = props.displayOrder;
        this.isActive = props.isActive ?? true;
        this.steps = props.steps.map((s) => knowledge_step_entity_1.KnowledgeStep.create(s));
    }
    static create(props) {
        if (!props.title.trim() || !props.summary.trim()) {
            throw new Error('title e summary são obrigatórios');
        }
        if (props.keywords.length === 0) {
            throw new Error('keywords não pode ser vazio');
        }
        if (props.steps.length < 3) {
            throw new Error('tópico deve ter pelo menos 3 passos');
        }
        return new KnowledgeTopic(props);
    }
}
exports.KnowledgeTopic = KnowledgeTopic;
//# sourceMappingURL=knowledge-topic.entity.js.map