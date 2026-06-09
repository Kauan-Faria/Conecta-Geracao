import { Injectable } from '@nestjs/common';
import {
  ConversationStatus as PrismaConversationStatus,
  MessageRole as PrismaMessageRole,
} from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  Conversation,
  Message,
} from '../../domain/entities/conversation.entity';
import {
  ConversationRepository,
  PaginatedConversations,
  PaginationParams,
} from '../../application/ports/conversation.repository';
import { ConversationStatus } from '../../domain/value-objects/conversation-status.vo';
import { MessageContent } from '../../domain/value-objects/message-content.vo';
import { MessageMetadataJson } from '../../domain/value-objects/message-metadata.vo';
import { MessageRole } from '../../domain/value-objects/message-role.vo';
import { Prisma } from '@prisma/client';

function parseMessageMetadata(value: Prisma.JsonValue | null): MessageMetadataJson | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as MessageMetadataJson;
}

@Injectable()
export class PrismaConversationRepository implements ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(conversation: Conversation): Promise<Conversation> {
    const row = await this.prisma.conversation.create({
      data: {
        firebaseUid: conversation.firebaseUid,
        topicSlug: conversation.topicSlug,
        status: conversation.status.value as PrismaConversationStatus,
        currentStep: conversation.currentStep,
      },
    });
    return this.toDomain(row);
  }

  async findByIdForUser(id: string, firebaseUid: string): Promise<Conversation | null> {
    const row = await this.prisma.conversation.findFirst({
      where: { id, firebaseUid },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async listByUser(
    firebaseUid: string,
    pagination: PaginationParams,
  ): Promise<PaginatedConversations> {
    const skip = (pagination.page - 1) * pagination.limit;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.conversation.findMany({
        where: { firebaseUid },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      this.prisma.conversation.count({ where: { firebaseUid } }),
    ]);

    return {
      items: rows.map((row) => this.toDomain(row)),
      total,
    };
  }

  private toDomain(row: {
    id: string;
    firebaseUid: string;
    topicSlug: string | null;
    status: PrismaConversationStatus;
    currentStep: number;
    createdAt: Date;
    updatedAt: Date;
  }): Conversation {
    return Conversation.create({
      id: row.id,
      firebaseUid: row.firebaseUid,
      topicSlug: row.topicSlug,
      status: ConversationStatus.from(row.status),
      currentStep: row.currentStep,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

@Injectable()
export class PrismaMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByConversationId(conversationId: string): Promise<Message[]> {
    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: {
    id: string;
    conversationId: string;
    role: PrismaMessageRole;
    content: string;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
  }): Message {
    return Message.create({
      id: row.id,
      conversationId: row.conversationId,
      role: MessageRole.from(row.role),
      content: MessageContent.create(row.content),
      metadata: parseMessageMetadata(row.metadata),
      createdAt: row.createdAt,
    });
  }
}

@Injectable()
export class PrismaConversationMessageUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(input: {
    conversationId: string;
    firebaseUid: string;
    userContent: string;
    assistantContent: string;
    nextCurrentStep: number;
    topicSlug?: string | null;
    assistantMetadata?: MessageMetadataJson | null;
  }): Promise<{ assistantMessage: Message }> {
    return this.prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.findFirst({
        where: { id: input.conversationId, firebaseUid: input.firebaseUid },
      });

      if (!conversation) {
        throw new Error('Conversa não encontrada na transação.');
      }

      if (conversation.status !== 'in_progress') {
        throw new Error('Conversa encerrada na transação.');
      }

      await tx.message.create({
        data: {
          conversationId: input.conversationId,
          role: 'user',
          content: input.userContent,
        },
      });

      const assistantRow = await tx.message.create({
        data: {
          conversationId: input.conversationId,
          role: 'assistant',
          content: input.assistantContent,
          metadata: (input.assistantMetadata as Prisma.InputJsonValue) ?? undefined,
        },
      });

      await tx.conversation.update({
        where: { id: input.conversationId },
        data: {
          updatedAt: new Date(),
          currentStep: input.nextCurrentStep,
          ...(input.topicSlug && !conversation.topicSlug
            ? { topicSlug: input.topicSlug }
            : {}),
        },
      });

      return {
        assistantMessage: Message.create({
          id: assistantRow.id,
          conversationId: assistantRow.conversationId,
          role: MessageRole.assistant(),
          content: MessageContent.create(assistantRow.content),
          metadata: parseMessageMetadata(assistantRow.metadata),
          createdAt: assistantRow.createdAt,
        }),
      };
    });
  }
}
