import { NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../../../domain/repositories/course.repository';
import { Course } from '../../../domain/entities/course.entity';

export class UpdateCourseUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
  ) {}

  async execute(code: string, data: Partial<Course>): Promise<Course> {
    const existing = await this.courseRepo.findByCode(code);
    if (!existing) throw new NotFoundException('Course not found');

    return this.courseRepo.update(code, data);
  }
}
