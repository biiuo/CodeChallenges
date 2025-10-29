import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Course } from '../../../domain/entities/course.entity';
import * as courseRepository from '../../../domain/repositories/course.repository';

@Injectable()
export class FindCourseByCodeUseCase {
  constructor(
    @Inject('ICourseRepository')
    private readonly courseRepo: courseRepository.CourseRepository,
  ) {}

  async execute(code: string): Promise<Course> {
    const c = await this.courseRepo.findByCode(code);
    if (!c) throw new NotFoundException('Course not found');
    return c;
  }
}

