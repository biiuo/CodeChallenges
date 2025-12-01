import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export interface SubmissionJob {
    submissionId: number;
    userId: string;
    challengeId: string;
    language: string;
    code: string;
}
export declare class SubmissionQueueService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private redis;
    private readonly QUEUE_KEY;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    enqueueSubmission(job: SubmissionJob): Promise<boolean>;
    dequeueSubmission(timeout?: number): Promise<SubmissionJob | null>;
    getQueueSize(): Promise<number>;
}
