import { CourseRepository } from '../../../domain/repositories/course.repository';
import { Course } from '../../../domain/entities/course.entity';
export declare class FindAllCoursesUseCase {
    private readonly courseRepo;
    constructor(courseRepo: CourseRepository);
    execute(): Promise<Course[]>;
}
