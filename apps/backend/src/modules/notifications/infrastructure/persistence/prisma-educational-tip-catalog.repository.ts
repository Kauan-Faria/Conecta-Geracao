import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { EducationalTipCatalogRepository } from '../../application/ports/educational-tip-catalog.repository';
import { EducationalTip } from '../../domain/entities/educational-tip.entity';

@Injectable()
export class PrismaEducationalTipCatalogRepository implements EducationalTipCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<EducationalTip[]> {
    const rows = await this.prisma.educationalTip.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((row) =>
      EducationalTip.reconstitute({
        id: row.id,
        title: row.title,
        body: row.body,
        deepLink: row.deepLink,
        topicTag: row.topicTag,
        isActive: row.isActive,
        sortOrder: row.sortOrder,
      }),
    );
  }

  async findById(id: string): Promise<EducationalTip | null> {
    const row = await this.prisma.educationalTip.findUnique({ where: { id } });
    if (!row) return null;

    return EducationalTip.reconstitute({
      id: row.id,
      title: row.title,
      body: row.body,
      deepLink: row.deepLink,
      topicTag: row.topicTag,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
    });
  }
}
