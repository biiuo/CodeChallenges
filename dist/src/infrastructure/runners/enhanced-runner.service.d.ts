import { ObservabilityService } from '../observability/observability.service';
export type TestCaseStatus = 'OK' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
export interface TestCase {
    id: number;
    caseNumber: number;
    input: string;
    output: string;
}
export interface TestCaseResult {
    caseNumber: number;
    status: TestCaseStatus;
    timeMs: number;
    output: string;
    errorMsg: string | null;
}
export interface ExecutionResult {
    status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
    score: number;
    timeMsTotal: number;
    cases: TestCaseResult[];
}
export declare class EnhancedRunnerService {
    private readonly observability;
    private readonly logger;
    constructor(observability: ObservabilityService);
    private readonly RUNNER_IMAGES;
    private readonly FILE_NAMES;
    executeSubmission(submissionId: number, language: string, code: string, testCases: TestCase[], timeLimit: number, memoryLimit: number): Promise<ExecutionResult>;
    private forceCleanupContainers;
    private compile;
    private executeTestCase;
    private killRunningContainers;
    private determineFinalStatus;
    private calculateScore;
    private createWorkDirectory;
    private cleanupWorkDirectory;
}
