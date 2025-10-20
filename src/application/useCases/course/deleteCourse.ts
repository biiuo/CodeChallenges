import { courseRepository } from '../../../domain/repositories/courseRepository';

export class deleteCourseUseCase {
  constructor(private readonly courseRepo: courseRepository) {}

  async execute(nrc: string): Promise<void> {
    const course = await this.courseRepo.findByNrc(nrc);
    if (!course) throw new Error('Course not found');

    await this.courseRepo.delete(nrc);
  }
}