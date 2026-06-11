import { Injectable } from '@nestjs/common';
import { ConversationStatus } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  AbandonedConversationQuery,
  AbandonedConversationSnapshot,
} from '../../application/ports/abandoned-conversation.query';

@Injectable()
export class PrismaAbandonedConversationQuery implements AbandonedConversationQuery {
  constructor(private readonly prisma: PrismaService) {}

  async findAbandoned(
    thresholdHours: number,
    limit: number,
  ): Promise<AbandonedConversationSnapshot[]> {
    const threshold = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

    const conversations = await this.prisma.conversation.findMany({
      where: {
        status: ConversationStatus.in_progress,
        messages: { some: {} },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      take: limit,
      orderBy: { updatedAt: 'asc' },
    });

    return conversations
      .filter((conversation) => {
        const lastMessage = conversation.messages[0];
        return lastMessage && lastMessage.createdAt < threshold;
      })
      .map((conversation) => ({
        conversationId: conversation.id,
        firebaseUid: conversation.firebaseUid,
        lastActivityAt: conversation.messages[0]!.createdAt,
        status: conversation.status as AbandonedConversationSnapshot['status'],
      }));
  }
}
