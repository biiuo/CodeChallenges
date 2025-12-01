import { PrismaService } from '../../infrastructure/persistence/prisma.service';
declare class CreateEvaluationDto {
    name: string;
    description: string;
    date: string;
    maxDuration: number;
    courseId: string;
}
declare class UpdateEvaluationDto {
    name?: string;
    description?: string;
    date?: string;
    maxDuration?: number;
}
export declare class EvaluationsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateEvaluationDto, req: any): Promise<{
        course: {
            id: string;
            name: string;
            code: string;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        description: string;
        courseId: string;
        evaluationNumber: number;
        date: Date;
        maxDuration: number;
    }>;
    list(req: any): Promise<({
        course: {
            id: string;
            name: string;
            code: string;
        };
        challenges: ({
            challenge: {
                id: string;
                title: string;
                difficulty: import("@prisma/client").$Enums.Difficulty;
            };
        } & {
            challengeId: string;
            evaluationId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        description: string;
        courseId: string;
        evaluationNumber: number;
        date: Date;
        maxDuration: number;
    })[]>;
    get(id: string, req: any): Promise<{
        course: {
            id: string;
            name: string;
            code: string;
        };
        challenges: ({
            challenge: {
                id: string;
                title: string;
                description: string;
                difficulty: import("@prisma/client").$Enums.Difficulty;
                tags: string[];
            };
        } & {
            challengeId: string;
            evaluationId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        description: string;
        courseId: string;
        evaluationNumber: number;
        date: Date;
        maxDuration: number;
    }>;
    update(id: string, dto: UpdateEvaluationDto, req: any): Promise<{
        course: {
            id: string;
            name: string;
            code: string;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        description: string;
        courseId: string;
        evaluationNumber: number;
        date: Date;
        maxDuration: number;
    }>;
    remove(id: string, req: any): Promise<{
        course: {
            id: string;
            name: string;
            code: string;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        description: string;
        courseId: string;
        evaluationNumber: number;
        date: Date;
        maxDuration: number;
    }>;
    addChallenge(id: string, challengeId: string, req: any): Promise<{
        ok: boolean;
    }>;
    removeChallenge(id: string, challengeId: string, req: any): Promise<{
        ok: boolean;
    }>;
    listSubmissions(id: string, req: any, studentId?: string): Promise<({
        user: {
            id: string;
            username: string;
            name: string;
        };
        challenge: {
            id: string;
            title: string;
        };
    } & {
        id: number;
        createdAt: Date;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        challengeId: string;
        language: string;
        code: string;
        score: number | null;
        timeMsTotal: number | null;
        userId: string;
        courseId: string | null;
        evaluationId: number | null;
        submissionNumber: number;
    })[]>;
    getEvaluationStatistics(id: string, req: any): Promise<{
        totalSubmissions: number;
        acceptedSubmissions: number;
        acceptanceRate: string | number;
        uniqueStudents: number;
        submissionsByChallenge: {
            challengeId: string;
            totalSubmissions: number;
            averageScore: number;
        }[];
        topStudents: {
            user: {
                id: string;
                username: string;
                name: string;
            } | null;
            totalScore: number;
            totalSubmissions: number;
        }[];
    }>;
}
export {};
