import { EducationalTip } from '../../domain/entities/educational-tip.entity';

export const EDUCATIONAL_TIP_CATALOG_REPOSITORY = Symbol(
  'EDUCATIONAL_TIP_CATALOG_REPOSITORY',
);

export interface EducationalTipCatalogRepository {
  findAllActive(): Promise<EducationalTip[]>;
  findById(id: string): Promise<EducationalTip | null>;
}
