import { CourseRepository } from '../../../domain/repositories/course.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Course } from '../../../domain/entities/course.entity';
import { CreateCourseDTO } from '../../dtos/course';
export declare class CreateCourseUseCase {
    private readonly courseRepo;
    private readonly userRepo;
    constructor(courseRepo: CourseRepository, userRepo: UserRepository);
    execute(dto: CreateCourseDTO): Promise<Course>;
}
