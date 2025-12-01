import { CourseRepository } from '../../../domain/repositories/course.repository';
import { Course } from '../../../domain/entities/course.entity';
export declare class UpdateCourseUseCase {
    private readonly courseRepo;
    constructor(courseRepo: CourseRepository);
    execute(code: string, data: Partial<Course>): Promise<Course>;
}
