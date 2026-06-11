export interface EducationalTipProps {
    id?: string;
    title: string;
    body: string;
    deepLink: string;
    topicTag?: string | null;
    isActive: boolean;
    sortOrder: number;
}
export declare class EducationalTip {
    readonly id?: string;
    readonly title: string;
    readonly body: string;
    readonly deepLink: string;
    readonly topicTag: string | null;
    readonly isActive: boolean;
    readonly sortOrder: number;
    private constructor();
    static reconstitute(props: EducationalTipProps): EducationalTip;
}
