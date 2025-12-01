import { CourseRepository } from '../../../domain/repositories/course.repository';
import { PrismaService } from '../../../infrastructure/persistence/prisma.service';
export interface CourseStatistics {
    courseId: string;
    courseName: string;
    totalStudents: number;
    totalChallenges: number;
    totalSubmissions: number;
    challengeStats: {
        challengeId: string;
        title: string;
        difficulty: string;
        totalAttempts: number;
        successfulSubmissions: number;
        successRate: number;
    }[];
    studentProgress: {
        studentId: string;
        studentName: string;
        challengesCompleted: number;
        totalSubmissions: number;
        averageScore: number;
    }[];
}
export declare class GetCourseStatisticsUseCase {
    private readonly courseRepo;
    private readonly prisma;
    constructor(courseRepo: CourseRepository, prisma: PrismaService);
    execute(courseId: string): Promise<CourseStatistics>;
}
