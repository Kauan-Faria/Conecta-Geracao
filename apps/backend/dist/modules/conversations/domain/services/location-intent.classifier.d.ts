import { PoiCategoryValue } from '../../../maps/domain/value-objects/poi-category.vo';
import { LocationContextHints } from './location-context-hints';
export interface LocationIntentAnalysis {
    isGeographic: boolean;
    detectedCategories: PoiCategoryValue[];
    isAmbiguousHealth: boolean;
    hints: LocationContextHints;
}
export declare class LocationIntentClassifier {
    analyze(message: string): LocationIntentAnalysis;
}
