import { Submission } from '../../domain/entities/submission.entity';
import { Submission as PrismaSubmission } from '@prisma/client';
export declare class SubmissionMapper {
    static toDomain(prismaSubmission: PrismaSubmission): Submission;
    static toPrisma(domainSubmission: Submission): Omit<PrismaSubmission, 'createdAt'>;
}
