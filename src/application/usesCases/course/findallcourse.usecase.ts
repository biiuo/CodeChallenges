import { CourseRepository } from '../../../domain/repositories/course.repository';
import { Course } from '../../../domain/entities/course.entity';

export class FindAllCoursesUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
  ) {}

  async execute(): Promise<Course[]> {
    return this.courseRepo.findAll();
  }
}