import { EducationalTipCatalogRepository } from '../../application/ports/educational-tip-catalog.repository';
export declare class CuratedContentPolicy {
    private readonly catalog;
    constructor(catalog: EducationalTipCatalogRepository);
    rejectDynamicContent(source: string): void;
    assertFromCatalog(tipId: string): Promise<void>;
}
