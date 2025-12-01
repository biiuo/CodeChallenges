import { Challenge } from '../../domain/entities/challenge.entity';
import { Challenge as PrismaChallenge, Testcase as PrismaTestcase } from '@prisma/client';
type PrismaChallengeWithTestcases = PrismaChallenge & {
    testcases?: PrismaTestcase[];
};
export declare class ChallengeMapper {
    static toDomain(prismaChallenge: PrismaChallengeWithTestcases): Challenge;
    static toPrisma(domainChallenge: Challenge): Omit<PrismaChallenge, 'createdAt' | 'updatedAt'>;
}
export {};
