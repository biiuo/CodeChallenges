import { CourseRepository } from '../../../domain/repositories/course.repository';
export interface RemoveChallengesFromCourseInput {
    courseId: string;
    challengeIds: string[];
}
export declare class RemoveChallengesFromCourseUseCase {
    private readonly courseRepo;
    constructor(courseRepo: CourseRepository);
    execute(input: RemoveChallengesFromCourseInput): Promise<{
        message: string;
        removedCount: number;
    }>;
}
