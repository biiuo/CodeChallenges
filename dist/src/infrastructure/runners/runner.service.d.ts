export declare enum ProgrammingLanguage {
    PYTHON = "python",
    NODE = "node",
    CPP = "cpp",
    JAVA = "java"
}
export interface RunResult {
    output: string;
    stderr: string;
    exitCode: number;
    timeMsElapsed: number;
    status: 'OK' | 'TLE' | 'RE' | 'CE';
    error?: string;
}
export interface TestCaseResult {
    caseNumber: number;
    status: 'OK' | 'WA' | 'TLE' | 'RE' | 'CE';
    expectedOutput: string;
    actualOutput: string;
    stderr: string;
    timeMs: number;
    input: string;
    errorMsg?: string;
    passed: boolean;
}
export interface ExecutionResult {
    status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
    score: number;
    timeMsTotal: number;
    totalCases: number;
    passedCases: number;
    failedCases: number;
    testResults: TestCaseResult[];
    message?: string;
}
export declare class RunnerService {
    private readonly logger;
    private readonly imageByLang;
    private readonly timeoutMs;
    private readonly cpuLimit;
    private readonly memoryLimit;
    executeAgainstTestCases(language: ProgrammingLanguage, code: string, testCases: Array<{
        caseNumber: number;
        input: string;
        output: string;
    }>, timeLimit?: number): Promise<ExecutionResult>;
    private logTestCaseResult;
    private calculateFinalResult;
    private getErrorMessage;
    executeCode(language: ProgrammingLanguage, code: string, input: string, timeLimit?: number): Promise<RunResult>;
    private buildDockerRunCommand;
    private getCodeFilename;
    private getExecutionCommand;
    private executeDockerWithTimeout;
    private compareOutputs;
}
