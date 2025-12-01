import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SubmissionQueueService } from '../queue/submission-queue.service';
import { ProcessSubmissionUseCase } from '../../application/usesCases/submission/process-submission.use-case';
import { ObservabilityService } from '../observability/observability.service';
export declare class SubmissionWorkerService implements OnModuleInit, OnModuleDestroy {
    private readonly queue;
    private readonly processSubmission;
    private readonly observability;
    private readonly logger;
    private isRunning;
    private workerPromise;
    constructor(queue: SubmissionQueueService, processSubmission: ProcessSubmissionUseCase, observability: ObservabilityService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private workerLoop;
    private processSubmissionWithRetry;
    private sleep;
    private startPeriodicCleanup;
    private exec;
    getStatus(): {
        isRunning: boolean;
        queueSize: number;
    };
}
