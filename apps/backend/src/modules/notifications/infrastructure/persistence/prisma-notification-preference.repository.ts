import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { NotificationPreferenceRepository } from '../../application/ports/notification-preference.repository';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';

@Injectable()
export class PrismaNotificationPreferenceRepository
  implements NotificationPreferenceRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByFirebaseUid(firebaseUid: string): Promise<NotificationPreference | null> {
    const row = await this.prisma.notificationPreference.findUnique({
      where: { firebaseUid },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async upsert(preference: NotificationPreference): Promise<NotificationPreference> {
    const row = await this.prisma.notificationPreference.upsert({
      where: { firebaseUid: preference.firebaseUid },
      create: {
        firebaseUid: preference.firebaseUid,
        enabled: preference.enabled,
      },
      update: {
        enabled: preference.enabled,
      },
    });
    return this.toDomain(row);
  }

  async getOrCreateDefault(firebaseUid: string): Promise<NotificationPreference> {
    const existing = await this.findByFirebaseUid(firebaseUid);
    if (existing) return existing;
    return this.upsert(NotificationPreference.createDefault(firebaseUid));
  }

  private toDomain(row: {
    firebaseUid: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): NotificationPreference {
    return NotificationPreference.reconstitute({
      firebaseUid: row.firebaseUid,
      enabled: row.enabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
