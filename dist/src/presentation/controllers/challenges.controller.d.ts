import { PrismaService } from '../../infrastructure/persistence/prisma.service';
declare class CreateChallengeDto {
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    tags: string[];
    timeLimit: number;
    memoryLimit: number;
    isPublic?: boolean;
}
declare class UpdateChallengeDto {
    title?: string;
    description?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    tags?: string[];
    timeLimit?: number;
    memoryLimit?: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    isPublic?: boolean;
}
export declare class ChallengesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateChallengeDto, req: any): Promise<{
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
    list(): Promise<{
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
    }[]>;
    get(id: string): Promise<{
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
    } | null>;
    update(id: string, dto: UpdateChallengeDto): Promise<{
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
    remove(id: string): Promise<{
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
    listTestcases(id: string, req: any): Promise<{
        createdAt: Date;
        challengeId: string;
        caseNumber: number;
        input: string;
        output: string;
        visible: boolean;
    }[]>;
    addTestcases(id: string, cases: {
        caseNumber: number;
        input: string;
        output: string;
        visible?: boolean;
    }[]): Promise<{
        ok: boolean;
    }>;
    deleteTestcase(id: string, caseNumber: string): Promise<{
        ok: boolean;
    }>;
    publish(id: string): Promise<{
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
    archive(id: string): Promise<{
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
    assignToCourse(id: string, courseId: string): Promise<{
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
    unassignFromCourse(id: string, courseId: string): Promise<{
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
}
export {};
