import { ChallengeStatus, Difficulty } from "src/domain/entities/challenge.entity";
export declare class CreateTestCaseDto {
    caseNumber: number;
    input: string;
    output: string;
    visible?: boolean;
}
export declare class CreateChallengeDto {
    title: string;
    description: string;
    difficulty?: Difficulty;
    tags?: string[];
    timeLimit: number;
    memoryLimit: number;
    authorId?: string;
    status?: ChallengeStatus;
    isPublic?: boolean;
    testcases?: CreateTestCaseDto[];
}
export declare class UpdateChallengeDto {
    title?: string;
    description?: string;
    difficulty?: Difficulty | null;
    tags?: string[];
    timeLimit?: number;
    memoryLimit?: number;
    status?: ChallengeStatus;
    courseCode?: string;
    solutionCode?: string;
    solutionLanguage?: string;
}
