// src/application/use-cases/course/create-course.usecase.ts
import { CourseRepository } from '../../../domain/repositories/course.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Course } from '../../../domain/entities/course.entity';
import { CreateCourseDTO } from '../../dtos/course';
import { randomUUID } from 'crypto';

export class CreateCourseUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute(dto: CreateCourseDTO): Promise<Course> {
    // 1️⃣ Validar si ya existe curso con ese code
    const existing = await this.courseRepo.findByCode(dto.code);
    if (existing) throw new Error('Course already exists');

    // 2️⃣ Si hay profesores, buscarlos
    let professorIds: string[] = [];
    if (dto.professorCode && dto.professorCode.length > 0) {
      const professors = await Promise.all(
        dto.professorCode.map((code) => this.userRepo.findByCodigo(code))
      );
      professorIds = professors
        .filter((p) => p !== null)
        .map((p) => (p as any).id);

      if (professorIds.length === 0) {
        throw new Error('No valid professors found');
      }
    }

    // 3️⃣ Crear la entidad del dominio
    const course = new Course(randomUUID(), dto.code, dto.name, dto.period);

    // 4️⃣ Guardar el curso y asociar profesores
    const createdCourse = await this.courseRepo.createWithProfessors(course, professorIds);
    return createdCourse;
  }
}
