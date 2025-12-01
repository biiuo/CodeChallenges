import { PrismaService } from 'src/infrastructure/persistence/prisma.service';
import { SubmissionQueueService } from 'src/infrastructure/queue/submission-queue.service';
import { ObservabilityService } from 'src/infrastructure/observability/observability.service';
export interface CreateSubmissionInput {
    userId: string;
    challengeId: string;
    language: string;
    code: string;
    courseId?: string;
    evaluationId?: number;
}
export declare class CreateSubmissionUseCase {
    private readonly prisma;
    private readonly queue;
    private readonly observability;
    private readonly logger;
    constructor(prisma: PrismaService, queue: SubmissionQueueService, observability: ObservabilityService);
    execute(input: CreateSubmissionInput): Promise<{
        id: number;
        createdAt: Date;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        challengeId: string;
        language: string;
        code: string;
        score: number | null;
        timeMsTotal: number | null;
        userId: string;
        courseId: string | null;
        evaluationId: number | null;
        submissionNumber: number;
    }>;
    private validateInput;
    private getNextSubmissionNumber;
    private normalizeLanguage;
}
