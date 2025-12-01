import { PrismaService } from '../../infrastructure/persistence/prisma.service';
declare class UpdateCourseDto {
    name?: string;
    period?: string;
}
export declare class CoursesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMyCourses(req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        code: string;
        period: string;
        isPublished: boolean;
    }[]>;
    create(body: any, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        period: string;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
    }>;
    list(req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        code: string;
        period: string;
        isPublished: boolean;
    }[]>;
    get(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        code: string;
        period: string;
        isPublished: boolean;
        professors: {
            id: string;
            username: string;
            email: string;
            name: string;
        }[];
    } | null>;
    getMy(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        period: string;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
    } | null>;
    update(id: string, dto: UpdateCourseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        period: string;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        period: string;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
    }>;
    assignProfessor(id: string, userId: string, req: any): Promise<{
        professors: {
            id: string;
            username: string;
            email: string;
            password: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        period: string;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
    }>;
    enrollStudent(id: string, userId: string): Promise<{
        ok: boolean;
    }>;
    selfEnroll(id: string, req: any): Promise<{
        ok: boolean;
        message: string;
    }>;
    selfUnenroll(id: string, req: any): Promise<{
        ok: boolean;
        message: string;
    }>;
    listStudents(id: string): Promise<({
        user: {
            id: string;
            username: string;
            email: string;
            password: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        userId: string;
        courseId: string;
        enrolledAt: Date;
    })[]>;
    listChallenges(id: string, req: any): Promise<({
        author: {
            id: string;
            username: string;
            name: string;
        };
        testcases: {
            createdAt: Date;
            challengeId: string;
            caseNumber: number;
            input: string;
            output: string;
            visible: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        difficulty: import("@prisma/client").$Enums.Difficulty;
        tags: string[];
        timeLimit: number;
        memoryLimit: number;
        status: import("@prisma/client").$Enums.ChallengeStatus;
        isPublic: boolean;
        solutionCode: string | null;
        solutionLanguage: string | null;
        authorId: string;
    })[]>;
    listMyChallenges(id: string): Promise<({
        author: {
            id: string;
            username: string;
            name: string;
        };
        testcases: {
            createdAt: Date;
            challengeId: string;
            caseNumber: number;
            input: string;
            output: string;
            visible: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        difficulty: import("@prisma/client").$Enums.Difficulty;
        tags: string[];
        timeLimit: number;
        memoryLimit: number;
        status: import("@prisma/client").$Enums.ChallengeStatus;
        isPublic: boolean;
        solutionCode: string | null;
        solutionLanguage: string | null;
        authorId: string;
    })[]>;
    assignMultipleChallenges(id: string, body: {
        challengeIds: string[];
    }): Promise<{
        message: string;
        addedCount: number;
    }>;
    publishChallengeInCourse(id: string, challengeId: string, body: {
        status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
    }): Promise<{
        message: string;
        challenge: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            difficulty: import("@prisma/client").$Enums.Difficulty;
            tags: string[];
            timeLimit: number;
            memoryLimit: number;
            status: import("@prisma/client").$Enums.ChallengeStatus;
            isPublic: boolean;
            solutionCode: string | null;
            solutionLanguage: string | null;
            authorId: string;
        };
    }>;
    assignChallenge(id: string, challengeId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        difficulty: import("@prisma/client").$Enums.Difficulty;
        tags: string[];
        timeLimit: number;
        memoryLimit: number;
        status: import("@prisma/client").$Enums.ChallengeStatus;
        isPublic: boolean;
        solutionCode: string | null;
        solutionLanguage: string | null;
        authorId: string;
    }>;
    listSubmissions(id: string, studentId?: string, challengeId?: string, status?: string, evaluationId?: string): Promise<({
        user: {
            id: string;
            username: string;
            email: string;
            name: string;
        };
        challenge: {
            id: string;
            title: string;
            difficulty: import("@prisma/client").$Enums.Difficulty;
        };
        evaluation: {
            id: number;
            name: string;
            evaluationNumber: number;
        } | null;
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
    listSubmissionsByChallenge(id: string, challengeId: string): Promise<{
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
    }[]>;
    listMySubmissions(id: string, req: any, evaluationId?: string, challengeId?: string, status?: string): Promise<({
        challenge: {
            id: string;
            title: string;
            difficulty: import("@prisma/client").$Enums.Difficulty;
        };
        evaluation: {
            id: number;
            name: string;
            evaluationNumber: number;
        } | null;
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
    listMySubmissionsByEvaluation(courseId: string, evaluationId: string, req: any): Promise<({
        challenge: {
            id: string;
            title: string;
            difficulty: import("@prisma/client").$Enums.Difficulty;
        };
        testResults: {
            status: string;
            caseNumber: number;
            timeMs: number;
        }[];
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
    unassignMultipleChallenges(id: string, body: {
        challengeIds: string[];
    }): Promise<{
        message: string;
        removedCount: number;
    }>;
    unassignChallenge(id: string, challengeId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        difficulty: import("@prisma/client").$Enums.Difficulty;
        tags: string[];
        timeLimit: number;
        memoryLimit: number;
        status: import("@prisma/client").$Enums.ChallengeStatus;
        isPublic: boolean;
        solutionCode: string | null;
        solutionLanguage: string | null;
        authorId: string;
    }>;
    removeStudent(id: string, userId: string): Promise<{
        ok: boolean;
    }>;
    removeProfessor(id: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        period: string;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
    }>;
    updateMetadata(id: string, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        period: string;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
    }>;
    listLessons(id: string): Promise<({
        resources: {
            id: string;
            title: string;
            type: string;
            lessonId: string;
            url: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        courseId: string;
        videoUrl: string | null;
        duration: string | null;
        order: number;
    })[]>;
    createLesson(id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        courseId: string;
        videoUrl: string | null;
        duration: string | null;
        order: number;
    }>;
    updateLesson(courseId: string, lessonId: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        courseId: string;
        videoUrl: string | null;
        duration: string | null;
        order: number;
    }>;
    deleteLesson(courseId: string, lessonId: string): Promise<{
        ok: boolean;
    }>;
    addResource(courseId: string, lessonId: string, body: any): Promise<{
        id: string;
        title: string;
        type: string;
        lessonId: string;
        url: string;
    }>;
    deleteResource(courseId: string, lessonId: string, resourceId: string): Promise<{
        ok: boolean;
    }>;
    listEvaluations(courseId: string, req: any): Promise<({
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
    createEvaluation(courseId: string, dto: any): Promise<{
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
    }>;
    getCourseStatistics(courseId: string): Promise<{
        totalStudents: number;
        totalChallenges: number;
        totalSubmissions: number;
        acceptedSubmissions: number;
        acceptanceRate: string | number;
        averageScore: number;
        submissionsByStatus: {
            status: import("@prisma/client").$Enums.SubmissionStatus;
            count: number;
        }[];
        submissionsByLanguage: {
            language: string;
            count: number;
        }[];
    }>;
    getStudentStatistics(courseId: string, studentId: string, req: any): Promise<{
        totalSubmissions: number;
        acceptedSubmissions: number;
        acceptanceRate: string | number;
        averageScore: number;
        challengesAttempted: number;
        submissionsByChallenge: {
            challengeId: string;
            attempts: number;
            bestScore: number | null;
        }[];
        bestSubmissions: {
            id: number;
            challenge: {
                id: string;
                title: string;
                difficulty: import("@prisma/client").$Enums.Difficulty;
            };
            score: number | null;
            timeMsTotal: number | null;
            createdAt: Date;
        }[];
    }>;
}
export {};
