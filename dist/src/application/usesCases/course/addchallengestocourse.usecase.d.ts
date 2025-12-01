import { CourseRepository } from '../../../domain/repositories/course.repository';
import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
export interface AddChallengesToCourseInput {
    courseId: string;
    challengeIds: string[];
}
export declare class AddChallengesToCourseUseCase {
    private readonly courseRepo;
    private readonly challengeRepo;
    constructor(courseRepo: CourseRepository, challengeRepo: ChallengeRepository);
    execute(input: AddChallengesToCourseInput): Promise<{
        message: string;
        addedCount: number;
        alreadyInCourse: string[];
    }>;
}
