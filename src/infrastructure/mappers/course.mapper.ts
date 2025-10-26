// src/infrastructure/mappers/course.mapper.ts
import { Course } from '../../domain/entities/course.entity';
import { Course as PrismaCourse } from '@prisma/client';

export class CourseMapper {
  static toDomain(prismaCourse: PrismaCourse): Course {
    return new Course(
      prismaCourse.id,
      prismaCourse.nrc,
      prismaCourse.name,
      prismaCourse.period,
      prismaCourse.group,
    );
  }

  static toPrisma(domainCourse: Course): Omit<PrismaCourse, 'createdAt' | 'updatedAt'> {
    return {
      id: domainCourse.id,
      nrc: domainCourse.nrc,
      name: domainCourse.name,
      period: domainCourse.period,
      group: domainCourse.group,
    } as PrismaCourse;
  }
}
