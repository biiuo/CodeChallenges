// src/domain/repositories/course.repository.ts
import { Course } from '../entities/course.entity';

export interface CourseRepository {
  create(course: Partial<Course>): Promise<Course>;
  createWithProfessors(course: Partial<Course>, professorIds: string[]): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findByCode(code: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  update(code: string, data: Partial<Course>): Promise<Course>;
  delete(code: string): Promise<void>;
}
