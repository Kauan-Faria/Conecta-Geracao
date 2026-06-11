import { EducationalTip } from '../../domain/entities/educational-tip.entity';
export declare const EDUCATIONAL_TIP_CATALOG_REPOSITORY: unique symbol;
export interface EducationalTipCatalogRepository {
    findAllActive(): Promise<EducationalTip[]>;
    findById(id: string): Promise<EducationalTip | null>;
}
