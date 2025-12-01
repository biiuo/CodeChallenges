// src/application/usesCases/course/addchallengestocourse.usecase.ts
import { CourseRepository } from '../../../domain/repositories/course.repository';
import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
import { CourseNotFoundException, ChallengeNotFoundException } from '../../exceptions/course.exceptions';

export interface AddChallengesToCourseInput {
  courseId: string;
  challengeIds: string[];
}

export class AddChallengesToCourseUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly challengeRepo: ChallengeRepository
  ) {}

  async execute(input: AddChallengesToCourseInput): Promise<{ 
    message: string; 
    addedCount: number;
    alreadyInCourse: string[];
  }> {
    // 1. Validar que el curso existe
    const course = await this.courseRepo.findById(input.courseId);
    if (!course) {
      throw new CourseNotFoundException(input.courseId);
    }

    // 2. Validar que todos los challenges existen
    const challengesPromises = input.challengeIds.map((id) => 
      this.challengeRepo.findById(id)
    );
    const challenges = await Promise.all(challengesPromises);
    
    // Verificar challenges que no existen
    const notFoundChallenges = input.challengeIds.filter((id, index) => !challenges[index]);
    if (notFoundChallenges.length > 0) {
      throw new ChallengeNotFoundException(
        `Challenges not found: ${notFoundChallenges.join(', ')}`
      );
    }

    // 3. Verificar cuáles challenges ya están en el curso
    const alreadyInCourse: string[] = [];
    const toAdd: string[] = [];

    for (const challengeId of input.challengeIds) {
      const isInCourse = await this.courseRepo.isChallengeInCourse(
        input.courseId, 
        challengeId
      );
      
      if (isInCourse) {
        alreadyInCourse.push(challengeId);
      } else {
        toAdd.push(challengeId);
      }
    }

    // 4. Agregar solo los challenges que no están en el curso
    if (toAdd.length > 0) {
      await this.courseRepo.addChallengesToCourse(input.courseId, toAdd);
    }

    return {
      message: toAdd.length > 0 
        ? `Successfully added ${toAdd.length} challenge(s) to course`
        : 'No new challenges added',
      addedCount: toAdd.length,
      alreadyInCourse: alreadyInCourse,
    };
  }
}
