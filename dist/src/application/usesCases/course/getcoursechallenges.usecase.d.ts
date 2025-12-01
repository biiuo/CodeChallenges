import { CourseRepository } from '../../../domain/repositories/course.repository';
export declare class GetCourseChallengesUseCase {
    private readonly courseRepo;
    constructor(courseRepo: CourseRepository);
    execute(courseId: string): Promise<any[]>;
}
