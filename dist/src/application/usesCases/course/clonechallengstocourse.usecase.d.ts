import { CourseRepository } from '../../../domain/repositories/course.repository';
export interface CloneChallengesToCourseInput {
    sourceCourseId: string;
    targetCourseId: string;
}
export declare class CloneChallengesToCourseUseCase {
    private readonly courseRepo;
    constructor(courseRepo: CourseRepository);
    execute(input: CloneChallengesToCourseInput): Promise<{
        message: string;
        clonedCount: number;
        skippedCount: number;
    }>;
}
