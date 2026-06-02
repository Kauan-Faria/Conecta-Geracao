"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeStep = void 0;
class KnowledgeStep {
    constructor(props) {
        this.id = props.id;
        this.topicId = props.topicId;
        this.order = props.order;
        this.instruction = props.instruction;
        this.checkpointQuestion = props.checkpointQuestion ?? null;
        this.checkpointHints = props.checkpointHints ?? [];
    }
    static create(props) {
        if (props.order < 1) {
            throw new Error('order deve ser >= 1');
        }
        if (!props.instruction.trim()) {
            throw new Error('instruction é obrigatória');
        }
        return new KnowledgeStep(props);
    }
}
exports.KnowledgeStep = KnowledgeStep;
//# sourceMappingURL=knowledge-step.entity.js.map