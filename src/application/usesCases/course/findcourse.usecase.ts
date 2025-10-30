import { NotFoundException } from '@nestjs/common';
import { Course } from '../../../domain/entities/course.entity';
import { CourseRepository } from '../../../domain/repositories/course.repository';

export class FindCourseByCodeUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
  ) {}

  async execute(code: string): Promise<Course> {
    const c = await this.courseRepo.findByCode(code);
    if (!c) throw new NotFoundException('Course not found');
    return c;
  }
}

