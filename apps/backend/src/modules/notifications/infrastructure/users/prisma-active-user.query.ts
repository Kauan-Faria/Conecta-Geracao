import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ActiveUserQuery } from '../../application/ports/active-user.query';

@Injectable()
export class PrismaActiveUserQuery implements ActiveUserQuery {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWithActiveTokensAndPreference(): Promise<string[]> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { isActive: true },
      select: { firebaseUid: true },
      distinct: ['firebaseUid'],
    });

    if (tokens.length === 0) {
      return [];
    }

    const uids = tokens.map((t) => t.firebaseUid);
    const disabled = await this.prisma.notificationPreference.findMany({
      where: { firebaseUid: { in: uids }, enabled: false },
      select: { firebaseUid: true },
    });
    const disabledSet = new Set(disabled.map((p) => p.firebaseUid));

    return uids.filter((uid) => !disabledSet.has(uid));
  }
}
