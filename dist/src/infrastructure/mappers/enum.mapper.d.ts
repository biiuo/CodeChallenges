import { Role as DomainRole } from '../../domain/entities/user.entity';
import { ChallengeStatus as DomainChallengeStatus, Difficulty as DomainDifficulty } from '../../domain/entities/challenge.entity';
import { SubmissionStatus as DomainSubmissionStatus } from '../../domain/entities/submission.entity';
import { Role as PrismaRole, ChallengeStatus as PrismaChallengeStatus, Difficulty as PrismaDifficulty, SubmissionStatus as PrismaSubmissionStatus } from '@prisma/client';
export declare class EnumMapper {
    static toDomainRole(role: PrismaRole): DomainRole;
    static toPrismaRole(role: DomainRole): PrismaRole;
    static toDomainChallengeStatus(status: PrismaChallengeStatus): DomainChallengeStatus;
    static toPrismaChallengeStatus(status: DomainChallengeStatus): PrismaChallengeStatus;
    static toDomainDifficulty(difficulty: PrismaDifficulty | null): DomainDifficulty | undefined;
    static toPrismaDifficulty(difficulty: DomainDifficulty | undefined): PrismaDifficulty | null;
    static toDomainSubmissionStatus(status: PrismaSubmissionStatus): DomainSubmissionStatus;
    static toPrismaSubmissionStatus(status: DomainSubmissionStatus): PrismaSubmissionStatus;
}
