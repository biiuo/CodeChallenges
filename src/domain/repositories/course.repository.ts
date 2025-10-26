// src/domain/repositories/course.repository.ts
import { Course } from '../entities/course.entity';

export interface CourseRepository {
  create(course: Partial<Course>): Promise<Course>;
  createWithProfessors(course: Partial<Course>, professorIds: number[]): Promise<Course>; // 👈 nuevo
  findById(id: number): Promise<Course | null>;
  findByNrc(nrc: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  update(nrc: string, data: Partial<Course>): Promise<Course>;
  delete(nrc: string): Promise<void>;
}
