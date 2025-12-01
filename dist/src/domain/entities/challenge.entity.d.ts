export declare enum ChallengeStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
export declare enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD"
}
export interface TestCase {
    challengeId?: string;
    caseNumber: number;
    input: string;
    output: string;
    visible: boolean;
    createdAt?: Date;
}
export declare class Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    tags: string[];
    timeLimit: number;
    memoryLimit: number;
    status: ChallengeStatus;
    isPublic: boolean;
    authorId: string;
    testCases?: TestCase[] | undefined;
    constructor(id: string, title: string, description: string, difficulty: Difficulty, tags: string[], timeLimit: number, memoryLimit: number, status: ChallengeStatus, isPublic: boolean, authorId: string, testCases?: TestCase[] | undefined);
}
