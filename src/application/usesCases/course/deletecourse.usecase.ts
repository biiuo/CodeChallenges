import { NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../../../domain/repositories/course.repository';
import { Course } from '../../../domain/entities/course.entity';

export class DeleteCourseUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
  ) {}

  async execute(code: string): Promise<void> {
    const existing = await this.courseRepo.findByCode(code);
    if (!existing) throw new NotFoundException('Course not found');

    await this.courseRepo.delete(code);
  }
}
