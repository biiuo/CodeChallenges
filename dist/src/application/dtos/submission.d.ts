export declare class CreateSubmissionDto {
    language: string;
    code: string;
    challengeId: string;
}
export declare class SubmissionResponseDto {
    id: number;
    userId: string;
    challengeId: string;
    code: string;
    language: string;
    status: string;
    score: number;
    timeMsTotal: number;
    createdAt: Date;
}
export declare class UpdateSubmissionStatusDto {
    status: string;
    score?: number;
    timeMsTotal?: number;
}
