import { Course } from '../../domain/entities/course.entity';
import { Course as PrismaCourse } from '@prisma/client';
export declare class CourseMapper {
    static toDomain(prismaCourse: PrismaCourse): Course;
    static toPrisma(domainCourse: Course): Omit<PrismaCourse, 'createdAt' | 'updatedAt'>;
}
