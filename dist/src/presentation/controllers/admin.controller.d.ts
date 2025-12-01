import { PrismaService } from '../../infrastructure/persistence/prisma.service';
export declare class AdminController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserActivity(userId: string, courseId?: string, challengeId?: string, status?: string, from?: string, to?: string): Promise<{
        userId: string;
        filters: {
            courseId: string | undefined;
            challengeId: string | undefined;
            status: string | undefined;
            from: string | undefined;
            to: string | undefined;
        };
        totals: {
            submissions: number;
            attempts: number;
            passed: number;
            failed: number;
        };
        challenges: any[];
        submissions: {
            id: number;
            challengeId: string;
            challengeTitle: any;
            status: import("@prisma/client").$Enums.SubmissionStatus;
            score: number;
            createdAt: Date;
            testCasesCount: number;
        }[];
    }>;
}
