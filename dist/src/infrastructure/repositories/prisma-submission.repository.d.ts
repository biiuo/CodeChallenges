import { PrismaService } from '../persistence/prisma.service';
import { SubmissionRepository } from '../../domain/repositories/submission.repository';
import { Submission, SubmissionStatus } from '../../domain/entities/submission.entity';
export declare class PrismaSubmissionRepository implements SubmissionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<Submission>): Promise<Submission>;
    findById(id: number): Promise<Submission | null>;
    findByUser(userId: string): Promise<Submission[]>;
    findByChallenge(challengeId: string): Promise<Submission[]>;
    findAll(): Promise<Submission[]>;
    update(id: number, data: Partial<Submission>): Promise<Submission>;
    delete(id: number): Promise<void>;
    findByStatus(status: SubmissionStatus): Promise<Submission[]>;
    createTestResult(data: {
        submissionId: number;
        caseNumber: number;
        status: string;
        timeMs: number;
        output: string | null;
        errorMsg: string | null;
    }): Promise<void>;
    getTestResults(submissionId: number): Promise<any[]>;
}
