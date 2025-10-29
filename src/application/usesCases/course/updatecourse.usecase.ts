import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as courseRepository from '../../../domain/repositories/course.repository';
import { Course } from '../../../domain/entities/course.entity';

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    private readonly courseRepo: courseRepository.CourseRepository,
  ) {}

  async execute(code: string, data: Partial<Course>): Promise<Course> {
    const existing = await this.courseRepo.findByCode(code);
    if (!existing) throw new NotFoundException('Course not found');

    return this.courseRepo.update(code, data);
  }
}
