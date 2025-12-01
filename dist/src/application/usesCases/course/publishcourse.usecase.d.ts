import { CourseRepository } from '../../../domain/repositories/course.repository';
export declare class PublishCourseUseCase {
    private readonly courseRepo;
    constructor(courseRepo: CourseRepository);
    execute(courseId: string, isPublished: boolean): Promise<{
        message: string;
        courseId: string;
        isPublished: boolean;
    }>;
}
