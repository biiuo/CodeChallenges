// src/application/usesCases/course/publishcourse.usecase.ts
import { CourseRepository } from '../../../domain/repositories/course.repository';
import { CourseNotFoundException } from '../../exceptions/course.exceptions';

export class PublishCourseUseCase {
  constructor(private readonly courseRepo: CourseRepository) {}

  async execute(courseId: string, isPublished: boolean): Promise<{
    message: string;
    courseId: string;
    isPublished: boolean;
  }> {
    // 1. Validar que el curso existe
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new CourseNotFoundException(courseId);
    }

    // 2. Actualizar el estado de publicación
    await this.courseRepo.update(course.code, { isPublished });

    return {
      message: isPublished 
        ? 'Course published successfully. Students can now enroll.'
        : 'Course unpublished successfully. New enrollments are disabled.',
      courseId,
      isPublished,
    };
  }
}
