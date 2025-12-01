// src/application/usesCases/course/getcoursechallenges.usecase.ts
import { CourseRepository } from '../../../domain/repositories/course.repository';
import { CourseNotFoundException } from '../../exceptions/course.exceptions';

export class GetCourseChallengesUseCase {
  constructor(private readonly courseRepo: CourseRepository) {}

  async execute(courseId: string): Promise<any[]> {
    // 1. Validar que el curso existe
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new CourseNotFoundException(courseId);
    }

    // 2. Obtener todos los challenges del curso
    const challenges = await this.courseRepo.findChallengesByCourseId(courseId);

    return challenges;
  }
}
