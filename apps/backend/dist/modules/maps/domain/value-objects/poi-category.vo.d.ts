export declare const POI_CATEGORIES: readonly ["pharmacy", "health_post", "hospital", "bank", "post_office", "supermarket"];
export type PoiCategoryValue = (typeof POI_CATEGORIES)[number];
export declare class PoiCategory {
    readonly value: PoiCategoryValue;
    private constructor();
    static create(raw: string): PoiCategory;
}
