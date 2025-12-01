import Redis from 'ioredis';
export interface SubmissionMetrics {
    submissionId: string;
    event: 'queued' | 'started' | 'caseResult' | 'finished' | 'error';
    timestamp: string;
    language?: string;
    status?: string;
    durationMs?: number;
    caseId?: number;
    runnerImage?: string;
    errorMessage?: string;
}
export declare class ObservabilityService {
    private readonly redis;
    private readonly logger;
    constructor(redis: Redis);
    private readonly KEYS;
    logSubmissionEvent(event: SubmissionMetrics): void;
    recordSubmission(status: string): Promise<void>;
    recordExecutionTime(durationMs: number): Promise<void>;
    incrementActiveRunners(): Promise<void>;
    decrementActiveRunners(): Promise<void>;
    getMetricsPrometheus(): Promise<string>;
    getMetricsJson(): Promise<{
        submissions_total: number;
        submissions_accepted: number;
        submissions_wrong_answer: number;
        submissions_time_limit_exceeded: number;
        submissions_runtime_error: number;
        submissions_compilation_error: number;
        submissions_failed_total: number;
        average_execution_time_ms: number;
        active_runners: number;
    }>;
    submissionCreated(submissionId: number, userId: string, challengeId: string, language: string): void;
    submissionEnqueued(submissionId: number, queueName?: string): void;
    submissionDequeued(submissionId: number): void;
    runnerStarted(submissionId: number, language: string, challengeId: string, testCasesCount: number): void;
    testCaseExecuted(submissionId: number, testCase: number, status: string, durationMs: number, output: string, expected: string, input?: string, stderr?: string, exitCode?: number): void;
    runnerFinished(submissionId: number, finalStatus: string, score: number, totalDurationMs: number): void;
    runnerError(submissionId: number, error: string, stderr?: string, exitCode?: number): void;
    compilationStarted(submissionId: number, language: string): void;
    compilationFailed(submissionId: number, stderr: string): void;
    compilationSucceeded(submissionId: number): void;
    debugRunner(submissionId: number, details: {
        command?: string;
        language?: string;
        workDir?: string;
        inputFile?: string;
        outputFile?: string;
        testCase?: number;
        rawOutput?: string;
        rawStderr?: string;
        exitCode?: number;
        timeMs?: number;
    }): void;
}
