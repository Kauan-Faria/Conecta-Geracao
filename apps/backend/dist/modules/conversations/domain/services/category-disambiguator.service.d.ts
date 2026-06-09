import { PoiCategory } from '../../../maps/domain/value-objects/poi-category.vo';
export declare const HEALTH_CLARIFICATION_QUESTION = "Voc\u00EA precisa de um posto de sa\u00FAde (UBS) ou de um hospital/UPA?";
export declare const MULTIPLE_CATEGORY_CLARIFICATION_QUESTION = "Vi que voc\u00EA mencionou mais de um tipo de lugar. Qual voc\u00EA quer buscar primeiro?";
export type CategoryResolution = {
    type: 'resolved';
    category: PoiCategory;
} | {
    type: 'clarification';
    question: string;
} | {
    type: 'none';
};
export declare class CategoryDisambiguator {
    resolve(message: string, messageHistory: {
        role: string;
        content: string;
    }[]): CategoryResolution;
    private resolveHealthFollowUp;
}
