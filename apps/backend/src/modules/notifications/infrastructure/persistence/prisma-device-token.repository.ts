import { Injectable } from '@nestjs/common';
import { DevicePlatform as PrismaDevicePlatform } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { DeviceTokenRepository } from '../../application/ports/device-token.repository';
import { DeviceToken } from '../../domain/entities/device-token.entity';
import { DevicePlatform } from '../../domain/value-objects/device-platform.vo';
import { FcmToken } from '../../domain/value-objects/fcm-token.vo';

@Injectable()
export class PrismaDeviceTokenRepository implements DeviceTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(token: DeviceToken): Promise<DeviceToken> {
    const row = await this.prisma.deviceToken.upsert({
      where: {
        firebaseUid_token: {
          firebaseUid: token.firebaseUid,
          token: token.token.value,
        },
      },
      create: {
        firebaseUid: token.firebaseUid,
        token: token.token.value,
        platform: token.platform.value as PrismaDevicePlatform,
        isActive: token.isActive,
        lastSeenAt: token.lastSeenAt,
      },
      update: {
        platform: token.platform.value as PrismaDevicePlatform,
        isActive: true,
        lastSeenAt: new Date(),
      },
    });

    return this.toDomain(row);
  }

  async findActiveByFirebaseUid(firebaseUid: string): Promise<DeviceToken[]> {
    const rows = await this.prisma.deviceToken.findMany({
      where: { firebaseUid, isActive: true },
      orderBy: { lastSeenAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async deactivateByFirebaseUidAndToken(
    firebaseUid: string,
    fcmToken: string,
  ): Promise<void> {
    await this.prisma.deviceToken.updateMany({
      where: { firebaseUid, token: fcmToken },
      data: { isActive: false },
    });
  }

  async deactivateById(id: string): Promise<void> {
    await this.prisma.deviceToken.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private toDomain(row: {
    id: string;
    firebaseUid: string;
    token: string;
    platform: PrismaDevicePlatform;
    isActive: boolean;
    lastSeenAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): DeviceToken {
    return DeviceToken.reconstitute({
      id: row.id,
      firebaseUid: row.firebaseUid,
      token: FcmToken.create(row.token),
      platform: DevicePlatform.create(row.platform),
      isActive: row.isActive,
      lastSeenAt: row.lastSeenAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
