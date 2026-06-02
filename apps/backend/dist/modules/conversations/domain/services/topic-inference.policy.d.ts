export interface TopicCandidate {
    slug: string;
    keywords: string[];
}
export declare class TopicInferencePolicy {
    inferSlug(userMessage: string, topics: TopicCandidate[]): string | null;
}
