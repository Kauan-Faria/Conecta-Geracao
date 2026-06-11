import { ProcessAbandonedConversationsUseCase } from '../../application/use-cases/process-abandoned-conversations.use-case';
export declare class AbandonedConversationsJob {
    private readonly processAbandonedConversations;
    private readonly logger;
    constructor(processAbandonedConversations: ProcessAbandonedConversationsUseCase);
    handleCron(): Promise<void>;
}
