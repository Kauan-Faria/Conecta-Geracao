export interface KnowledgeStepProps {
    id?: string;
    topicId?: string;
    order: number;
    instruction: string;
    checkpointQuestion?: string | null;
    checkpointHints?: string[];
}
export declare class KnowledgeStep {
    readonly id?: string;
    readonly topicId?: string;
    readonly order: number;
    readonly instruction: string;
    readonly checkpointQuestion?: string | null;
    readonly checkpointHints: string[];
    private constructor();
    static create(props: KnowledgeStepProps): KnowledgeStep;
}
