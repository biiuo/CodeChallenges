export declare enum SubmissionStatus {
    QUEUED = "QUEUED",
    RUNNING = "RUNNING",
    ACCEPTED = "ACCEPTED",
    WRONG_ANSWER = "WRONG_ANSWER",
    TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED",
    COMPILATION_ERROR = "COMPILATION_ERROR",
    RUNTIME_ERROR = "RUNTIME_ERROR"
}
export declare class Submission {
    id: number;
    language: string;
    code: string;
    status: SubmissionStatus;
    score?: number;
    timeMsTotal?: number;
    createdAt?: Date;
    userId: string;
    challengeId: string;
    constructor(props: Partial<Submission>);
}
