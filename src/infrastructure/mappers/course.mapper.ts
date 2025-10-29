// src/infrastructure/mappers/course.mapper.ts
import { Course } from '../../domain/entities/course.entity';
import { Course as PrismaCourse } from '@prisma/client';

export class CourseMapper {
  static toDomain(prismaCourse: PrismaCourse): Course {
    return new Course(
      prismaCourse.id,
      prismaCourse.code,
      prismaCourse.name,
      prismaCourse.period,
    );
  }

  static toPrisma(domainCourse: Course): Omit<PrismaCourse, 'createdAt' | 'updatedAt'> {
    return {
      id: domainCourse.id,
      code: domainCourse.code,
      name: domainCourse.name,
      period: domainCourse.period,
    } as PrismaCourse;
  }
}
