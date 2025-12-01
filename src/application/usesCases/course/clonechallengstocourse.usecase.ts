// src/application/usesCases/course/clonechallengstocourse.usecase.ts
import { CourseRepository } from '../../../domain/repositories/course.repository';
import { CourseNotFoundException } from '../../exceptions/course.exceptions';

export interface CloneChallengesToCourseInput {
  sourceCourseId: string;
  targetCourseId: string;
}

export class CloneChallengesToCourseUseCase {
  constructor(private readonly courseRepo: CourseRepository) {}

  async execute(input: CloneChallengesToCourseInput): Promise<{
    message: string;
    clonedCount: number;
    skippedCount: number;
  }> {
    // 1. Validar que ambos cursos existen
    const [sourceCourse, targetCourse] = await Promise.all([
      this.courseRepo.findById(input.sourceCourseId),
      this.courseRepo.findById(input.targetCourseId),
    ]);

    if (!sourceCourse) {
      throw new CourseNotFoundException(input.sourceCourseId);
    }

    if (!targetCourse) {
      throw new CourseNotFoundException(input.targetCourseId);
    }

    // 2. Obtener challenges del curso origen
    const sourceChallenges = await this.courseRepo.findChallengesByCourseId(
      input.sourceCourseId
    );

    if (sourceChallenges.length === 0) {
      return {
        message: 'Source course has no challenges to clone',
        clonedCount: 0,
        skippedCount: 0,
      };
    }

    // 3. Verificar cuáles challenges ya están en el curso destino
    const challengeIds = sourceChallenges.map((c: any) => c.id);
    const alreadyInTarget: string[] = [];
    const toClone: string[] = [];

    for (const challengeId of challengeIds) {
      const exists = await this.courseRepo.isChallengeInCourse(
        input.targetCourseId,
        challengeId
      );

      if (exists) {
        alreadyInTarget.push(challengeId);
      } else {
        toClone.push(challengeId);
      }
    }

    // 4. Agregar challenges que no están en el curso destino
    if (toClone.length > 0) {
      await this.courseRepo.addChallengesToCourse(
        input.targetCourseId,
        toClone
      );
    }

    return {
      message: `Successfully cloned ${toClone.length} challenge(s) from source course to target course`,
      clonedCount: toClone.length,
      skippedCount: alreadyInTarget.length,
    };
  }
}
