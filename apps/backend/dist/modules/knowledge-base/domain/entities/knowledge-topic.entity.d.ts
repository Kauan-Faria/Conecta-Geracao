import { KnowledgeStep, KnowledgeStepProps } from './knowledge-step.entity';
export interface KnowledgeTopicProps {
    id?: string;
    slug: string;
    title: string;
    summary: string;
    keywords: string[];
    displayOrder: number;
    isActive?: boolean;
    steps: KnowledgeStepProps[];
}
export declare class KnowledgeTopic {
    readonly id?: string;
    readonly slug: string;
    readonly title: string;
    readonly summary: string;
    readonly keywords: string[];
    readonly displayOrder: number;
    readonly isActive: boolean;
    readonly steps: KnowledgeStep[];
    private constructor();
    static create(props: KnowledgeTopicProps): KnowledgeTopic;
}
