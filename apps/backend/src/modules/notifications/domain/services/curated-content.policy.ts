import { Inject, Injectable } from '@nestjs/common';
import { DynamicContentNotAllowedError } from '../errors/domain.errors';
import {
  EDUCATIONAL_TIP_CATALOG_REPOSITORY,
  EducationalTipCatalogRepository,
} from '../../application/ports/educational-tip-catalog.repository';

@Injectable()
export class CuratedContentPolicy {
  constructor(
    @Inject(EDUCATIONAL_TIP_CATALOG_REPOSITORY)
    private readonly catalog: EducationalTipCatalogRepository,
  ) {}

  rejectDynamicContent(source: string): void {
    if (source === 'llm' || source === 'dynamic') {
      throw new DynamicContentNotAllowedError();
    }
  }

  async assertFromCatalog(tipId: string): Promise<void> {
    const tip = await this.catalog.findById(tipId);
    if (!tip || !tip.isActive) {
      throw new DynamicContentNotAllowedError('Dica não encontrada no catálogo curado.');
    }
  }
}
