import { Inject, Injectable } from '@nestjs/common';
import * as courseRepository from '../../../domain/repositories/course.repository';
import { Course } from '../../../domain/entities/course.entity';

@Injectable()
export class FindAllCoursesUseCase {
  constructor(
    @Inject('ICourseRepository')
    private readonly courseRepo: courseRepository.CourseRepository,
  ) {}

  async execute(): Promise<Course[]> {
    return this.courseRepo.findAll();
  }
}