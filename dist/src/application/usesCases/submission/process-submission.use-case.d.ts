import { PrismaService } from 'src/infrastructure/persistence/prisma.service';
import { EnhancedRunnerService } from '../../../infrastructure/runners/enhanced-runner.service';
export interface ProcessSubmissionInput {
    submissionId: number;
}
export interface ProcessSubmissionOutput {
    submissionId: number;
    status: string;
    score: number;
    timeMsTotal: number;
    casesProcessed: number;
}
export declare class ProcessSubmissionUseCase {
    private readonly prisma;
    private readonly runner;
    private readonly logger;
    constructor(prisma: PrismaService, runner: EnhancedRunnerService);
    execute(input: ProcessSubmissionInput): Promise<ProcessSubmissionOutput>;
}
