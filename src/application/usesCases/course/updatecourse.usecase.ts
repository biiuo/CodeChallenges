import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as courseRepository from '../../../domain/repositories/course.repository';
import { Course } from '../../../domain/entities/course.entity';

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    @Inject('ICourseRepository')
    private readonly courseRepo: courseRepository.CourseRepository,
  ) {}

  async execute(nrc: string, data: Partial<Course>): Promise<Course> {
    const existing = await this.courseRepo.findByNrc(nrc);
    if (!existing) throw new NotFoundException('Course not found');

    return this.courseRepo.update(nrc, data);
  }
}
