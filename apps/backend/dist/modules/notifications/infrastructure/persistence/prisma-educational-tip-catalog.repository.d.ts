import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { EducationalTipCatalogRepository } from '../../application/ports/educational-tip-catalog.repository';
import { EducationalTip } from '../../domain/entities/educational-tip.entity';
export declare class PrismaEducationalTipCatalogRepository implements EducationalTipCatalogRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllActive(): Promise<EducationalTip[]>;
    findById(id: string): Promise<EducationalTip | null>;
}
