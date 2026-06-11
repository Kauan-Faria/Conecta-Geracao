import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AbandonedConversationQuery, AbandonedConversationSnapshot } from '../../application/ports/abandoned-conversation.query';
export declare class PrismaAbandonedConversationQuery implements AbandonedConversationQuery {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAbandoned(thresholdHours: number, limit: number): Promise<AbandonedConversationSnapshot[]>;
}
