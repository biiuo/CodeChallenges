import { CreateSubmissionUseCase } from 'src/application/usesCases/submission/create-submission.use-case';
import { PrismaSubmissionRepository } from 'src/infrastructure/repositories/prisma-submission.repository';
import { PrismaChallengeRepository } from 'src/infrastructure/repositories/prisma-challenge.repository';
import { ObservabilityService } from 'src/infrastructure/observability/observability.service';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';
import { Submission } from 'src/domain/entities/submission.entity';
import { CreateSubmissionDto } from 'src/application/dtos/submission';
export declare class SubmissionController {
    private readonly createSubmissionUseCase;
    private readonly submissionRepo;
    private readonly challengeRepo;
    private readonly observability;
    private readonly prisma;
    private readonly logger;
    constructor(createSubmissionUseCase: CreateSubmissionUseCase, submissionRepo: PrismaSubmissionRepository, challengeRepo: PrismaChallengeRepository, observability: ObservabilityService, prisma: PrismaService);
    createSubmission(dto: CreateSubmissionDto | undefined, req: any): Promise<Submission>;
    getSubmission(submissionId: number): Promise<Submission>;
    getSubmissionResults(submissionId: number): Promise<any[]>;
    listSubmissions(req: any, filterUserId?: string, courseId?: string, challengeId?: string, status?: string, language?: string, evaluationId?: string): Promise<Submission[]>;
    executeSubmissionRoute(submissionId: number): Promise<any>;
    getMetrics(): Promise<any>;
}
