import { PrismaService } from '../persistence/prisma.service';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { Course } from '../../domain/entities/course.entity';
export declare class PrismaCourseRepository implements CourseRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(course: Partial<Course>): Promise<Course>;
    createWithProfessors(course: Partial<Course>, professorIds: string[]): Promise<Course>;
    findById(id: string): Promise<Course | null>;
    findByCode(code: string): Promise<Course | null>;
    findAll(): Promise<Course[]>;
    update(code: string, data: Partial<Course>): Promise<Course>;
    delete(code: string): Promise<void>;
    addChallengesToCourse(courseId: string, challengeIds: string[]): Promise<void>;
    removeChallengesFromCourse(courseId: string, challengeIds: string[]): Promise<void>;
    findChallengesByCourseId(courseId: string): Promise<any[]>;
    isChallengeInCourse(courseId: string, challengeId: string): Promise<boolean>;
}
