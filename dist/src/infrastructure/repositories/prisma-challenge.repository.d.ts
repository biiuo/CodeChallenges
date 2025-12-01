import { PrismaService } from '../persistence/prisma.service';
import { ChallengeRepository } from '../../domain/repositories/challenge.repository';
import { Challenge, ChallengeStatus } from '../../domain/entities/challenge.entity';
export declare class PrismaChallengeRepository implements ChallengeRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<Challenge>): Promise<Challenge>;
    findById(id: string): Promise<Challenge | null>;
    findByTitle(title: string): Promise<Challenge | null>;
    findAll(): Promise<Challenge[]>;
    findByCourse(courseId: string): Promise<Challenge[]>;
    findByStatus(status: ChallengeStatus): Promise<Challenge[]>;
    findPublished(): Promise<Challenge[]>;
    update(id: string, data: Partial<Challenge>): Promise<Challenge>;
    delete(id: string): Promise<void>;
    addTestCases(challengeId: string, testcases: Array<{
        caseNumber: number;
        input: string;
        output: string;
        visible?: boolean;
    }>): Promise<void>;
}
