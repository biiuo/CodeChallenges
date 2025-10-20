import { courseRepository } from '../../../domain/repositories/courseRepository';
import { course } from '../../../domain/entities/courseEntity';

export class createCourseUseCase {
  constructor(private readonly courseRepo: courseRepository) {}

  async execute(dto: any): Promise<course> {
    return this.courseRepo.create(dto);
  }
}