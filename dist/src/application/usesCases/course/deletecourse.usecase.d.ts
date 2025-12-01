import { CourseRepository } from '../../../domain/repositories/course.repository';
export declare class DeleteCourseUseCase {
    private readonly courseRepo;
    constructor(courseRepo: CourseRepository);
    execute(code: string): Promise<void>;
}
