import { Course } from '../../../domain/entities/course.entity';
import { CourseRepository } from '../../../domain/repositories/course.repository';
export declare class FindCourseByCodeUseCase {
    private readonly courseRepo;
    constructor(courseRepo: CourseRepository);
    execute(code: string): Promise<Course>;
}
