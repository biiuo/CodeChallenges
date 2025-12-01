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
        code: string;
        name: string;
        period: string;
        description: string | null;
        isPublished: boolean;
    }[]>;
    create(body: any, req: any): Promise<{
        id: string;
        code: string;
        name: string;
        period: string;
        description: string | null;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(req: any): Promise<{
        id: string;
        code: string;
        name: string;
        period: string;
        description: string | null;
        isPublished: boolean;
    }[]>;
    get(id: string): Promise<{
        id: string;
        code: string;
        name: string;
        period: string;
        description: string | null;
        isPublished: boolean;
        professors: {
            id: string;
            name: string;
            username: string;
            email: string;
        }[];
    } | null>;
    getMy(id: string): Promise<{
        id: string;
        code: string;
        name: string;
        period: string;
        description: string | null;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: string, dto: UpdateCourseDto): Promise<{
        id: string;
        code: string;
        name: string;
        period: string;
        description: string | null;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        code: string;
        name: string;
        period: string;
        description: string | null;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignProfessor(id: string, userId: string, req: any): Promise<{
        professors: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            username: string;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
        }[];
    } & {
        id: string;
        code: string;
        name: string;
        period: string;
        description: string | null;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            username: string;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        userId: string;
        courseId: string;
        enrolledAt: Date;
    })[]>;
    listChallenges(id: string, req: any): Promise<({
        author: {
            id: string;
            name: string;
            username: string;
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
        description: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
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
            name: string;
            username: string;
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
        description: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
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
            description: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
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
        description: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
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
            name: string;
            username: string;
            email: string;
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
        code: string;
        createdAt: Date;
        userId: string;
        courseId: string | null;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        challengeId: string;
        submissionNumber: number;
        language: string;
        score: number | null;
        timeMsTotal: number | null;
        evaluationId: number | null;
    })[]>;
    listSubmissionsByChallenge(id: string, challengeId: string): Promise<{
        id: number;
        code: string;
        createdAt: Date;
        userId: string;
        courseId: string | null;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        challengeId: string;
        submissionNumber: number;
        language: string;
        score: number | null;
        timeMsTotal: number | null;
        evaluationId: number | null;
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
        code: string;
        createdAt: Date;
        userId: string;
        courseId: string | null;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        challengeId: string;
        submissionNumber: number;
        language: string;
        score: number | null;
        timeMsTotal: number | null;
        evaluationId: number | null;
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
        code: string;
        createdAt: Date;
        userId: string;
        courseId: string | null;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        challengeId: string;
        submissionNumber: number;
        language: string;
        score: number | null;
        timeMsTotal: number | null;
        evaluationId: number | null;
    })[]>;
    unassignMultipleChallenges(id: string, body: {
        challengeIds: string[];
    }): Promise<{
        message: string;
        removedCount: number;
    }>;
    unassignChallenge(id: string, challengeId: string): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
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
        code: string;
        name: string;
        period: string;
        description: string | null;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMetadata(id: string, body: any): Promise<{
        id: string;
        code: string;
        name: string;
        period: string;
        description: string | null;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listLessons(id: string): Promise<({
        resources: {
            id: string;
            title: string;
            lessonId: string;
            url: string;
            type: string;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
        videoUrl: string | null;
        duration: string | null;
        order: number;
    })[]>;
    createLesson(id: string, body: any): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
        videoUrl: string | null;
        duration: string | null;
        order: number;
    }>;
    updateLesson(courseId: string, lessonId: string, body: any): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
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
        lessonId: string;
        url: string;
        type: string;
    }>;
    deleteResource(courseId: string, lessonId: string, resourceId: string): Promise<{
        ok: boolean;
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
        _count: {
            submissions: number;
        };
    } & {
        id: number;
        name: string;
        description: string;
        createdAt: Date;
        courseId: string;
        evaluationNumber: number;
        date: Date;
        maxDuration: number;
    })[]>;
}
export {};
