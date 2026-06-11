import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ActiveUserQuery } from '../../application/ports/active-user.query';
export declare class PrismaActiveUserQuery implements ActiveUserQuery {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllWithActiveTokensAndPreference(): Promise<string[]>;
}
