// src/application/usesCases/course/removechallengesfromcourse.usecase.ts
import { CourseRepository } from '../../../domain/repositories/course.repository';
import { CourseNotFoundException } from '../../exceptions/course.exceptions';

export interface RemoveChallengesFromCourseInput {
  courseId: string;
  challengeIds: string[];
}

export class RemoveChallengesFromCourseUseCase {
  constructor(private readonly courseRepo: CourseRepository) {}

  async execute(input: RemoveChallengesFromCourseInput): Promise<{ 
    message: string; 
    removedCount: number;
  }> {
    // 1. Validar que el curso existe
    const course = await this.courseRepo.findById(input.courseId);
    if (!course) {
      throw new CourseNotFoundException(input.courseId);
    }

    // 2. Verificar cuáles challenges están actualmente en el curso
    const toRemove: string[] = [];
    
    for (const challengeId of input.challengeIds) {
      const isInCourse = await this.courseRepo.isChallengeInCourse(
        input.courseId, 
        challengeId
      );
      
      if (isInCourse) {
        toRemove.push(challengeId);
      }
    }

    // 3. Remover los challenges que están en el curso
    if (toRemove.length > 0) {
      await this.courseRepo.removeChallengesFromCourse(input.courseId, toRemove);
    }

    return {
      message: toRemove.length > 0
        ? `Successfully removed ${toRemove.length} challenge(s) from course`
        : 'No challenges were removed',
      removedCount: toRemove.length,
    };
  }
}
