import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as courseRepository from '../../../domain/repositories/course.repository';
import { Course } from '../../../domain/entities/course.entity';

@Injectable()
export class DeleteCourseUseCase {
  constructor(
    private readonly courseRepo: courseRepository.CourseRepository,
  ) {}

  async execute(code: string): Promise<void> {
    const existing = await this.courseRepo.findByCode(code);
    if (!existing) throw new NotFoundException('Course not found');

    await this.courseRepo.delete(code);
  }
}
