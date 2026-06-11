import { Injectable } from '@nestjs/common';
import {
  NotificationDeliveryType as PrismaNotificationDeliveryType,
  NotificationDeliveryStatus as PrismaNotificationDeliveryStatus,
} from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { NotificationDeliveryLogRepository } from '../../application/ports/notification-delivery-log.repository';
import { NotificationDeliveryLog } from '../../domain/entities/notification-delivery-log.entity';
import { NotificationTypeValue } from '../../domain/value-objects/notification-type.vo';

@Injectable()
export class PrismaNotificationDeliveryLogRepository implements NotificationDeliveryLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(log: NotificationDeliveryLog): Promise<NotificationDeliveryLog> {
    const row = await this.prisma.notificationDeliveryLog.create({
      data: {
        firebaseUid: log.firebaseUid,
        conversationId: log.conversationId,
        notificationType: log.notificationType as PrismaNotificationDeliveryType,
        status: log.status as PrismaNotificationDeliveryStatus,
        fcmMessageId: log.fcmMessageId,
        skippedReason: log.skippedReason,
        sentAt: log.sentAt,
      },
    });

    return NotificationDeliveryLog.reconstitute({
      id: row.id,
      firebaseUid: row.firebaseUid,
      conversationId: row.conversationId,
      notificationType: row.notificationType as NotificationTypeValue,
      status: row.status as 'sent' | 'skipped',
      fcmMessageId: row.fcmMessageId,
      skippedReason: row.skippedReason,
      sentAt: row.sentAt,
    });
  }

  async findLastSentReminder(conversationId: string): Promise<NotificationDeliveryLog | null> {
    const row = await this.prisma.notificationDeliveryLog.findFirst({
      where: {
        conversationId,
        notificationType: 'reminder',
        status: 'sent',
      },
      orderBy: { sentAt: 'desc' },
    });

    if (!row) return null;

    return NotificationDeliveryLog.reconstitute({
      id: row.id,
      firebaseUid: row.firebaseUid,
      conversationId: row.conversationId,
      notificationType: row.notificationType as NotificationTypeValue,
      status: row.status as 'sent' | 'skipped',
      fcmMessageId: row.fcmMessageId,
      skippedReason: row.skippedReason,
      sentAt: row.sentAt,
    });
  }

  async existsSentWithin(
    conversationId: string,
    type: NotificationTypeValue,
    hours: number,
  ): Promise<boolean> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const row = await this.prisma.notificationDeliveryLog.findFirst({
      where: {
        conversationId,
        notificationType: type as PrismaNotificationDeliveryType,
        status: 'sent',
        sentAt: { gte: since },
      },
      select: { id: true },
    });
    return row !== null;
  }

  async existsUserSentWithin(
    firebaseUid: string,
    type: NotificationTypeValue,
    days: number,
  ): Promise<boolean> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const row = await this.prisma.notificationDeliveryLog.findFirst({
      where: {
        firebaseUid,
        notificationType: type as PrismaNotificationDeliveryType,
        status: 'sent',
        sentAt: { gte: since },
      },
      select: { id: true },
    });
    return row !== null;
  }
}
